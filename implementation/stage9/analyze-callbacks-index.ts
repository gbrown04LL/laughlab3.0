// supabase/functions/analyze-callbacks/index.ts
// Stage 9: Callback Architecture Mapping

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CallbackSetup {
  line: string
  lineNumber: number
  page: number
  jokeId: string
}

interface CallbackReference {
  lineNumber: number
  page: number
  relation: 'same_punchline_phrase' | 'situational_echo' | 'character_callback' | 'thematic_callback'
  similarity: number
}

interface CallbackCluster {
  id: string
  setup: CallbackSetup
  references: CallbackReference[]
}

interface MissedOpportunity {
  setup: string
  lineNumber: number
  page: number
  suggestion: string
  potentialImpact: 'high' | 'medium' | 'low'
}

interface CallbackAnalysis {
  callbacks: CallbackCluster[]
  metrics: {
    callbackCount: number
    callbackFrequencyPercent: number
    totalJokes: number
    averageCallbacksPerSetup: number
  }
  missedOpportunities: MissedOpportunity[]
}

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { jobId, scriptText, jokes, timeline } = await req.json()

    if (!jobId || !jokes) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Analyze callbacks
    const callbackAnalysis = await analyzeCallbacks(jokes, scriptText, timeline)

    // Store results
    const { error: updateError } = await supabaseClient
      .from('analysis_jobs')
      .update({
        stage_9_output: callbackAnalysis,
        stage_9_completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, data: callbackAnalysis }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Callback analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function analyzeCallbacks(
  jokes: any[],
  scriptText: string,
  timeline: any[]
): Promise<CallbackAnalysis> {
  const callbacks: CallbackCluster[] = []
  const missedOpportunities: MissedOpportunity[] = []
  const processedSetups = new Set<string>()

  // Step 1: Identify potential callback setups (unique phrases, character moments, situations)
  const potentialSetups = jokes.filter(joke => {
    // Look for jokes with memorable phrases or unique situations
    return joke.text && joke.text.length > 10
  })

  // Step 2: For each potential setup, find references
  for (let i = 0; i < potentialSetups.length; i++) {
    const setup = potentialSetups[i]
    const setupKey = normalizeText(setup.text)

    if (processedSetups.has(setupKey)) continue

    const references: CallbackReference[] = []

    // Look for callbacks in later jokes
    for (let j = i + 1; j < jokes.length; j++) {
      const laterJoke = jokes[j]
      const similarity = calculateSimilarity(setup.text, laterJoke.text)

      if (similarity > 0.3) {
        // Threshold for callback detection
        references.push({
          lineNumber: laterJoke.lineNumber || j,
          page: laterJoke.page || Math.floor(j / 10) + 1,
          relation: determineRelationType(setup.text, laterJoke.text, similarity),
          similarity,
        })
      }
    }

    // If we found callbacks, add to the list
    if (references.length > 0) {
      callbacks.push({
        id: `callback_${callbacks.length + 1}`,
        setup: {
          line: setup.text,
          lineNumber: setup.lineNumber || i,
          page: setup.page || Math.floor(i / 10) + 1,
          jokeId: setup.id || `joke_${i}`,
        },
        references,
      })
      processedSetups.add(setupKey)
    } else if (hasCallbackPotential(setup.text)) {
      // Strong setup with no callback - missed opportunity
      missedOpportunities.push({
        setup: setup.text,
        lineNumber: setup.lineNumber || i,
        page: setup.page || Math.floor(i / 10) + 1,
        suggestion: generateCallbackSuggestion(setup.text),
        potentialImpact: assessCallbackPotential(setup.text),
      })
    }
  }

  // Step 3: Calculate metrics
  const totalCallbackReferences = callbacks.reduce(
    (sum, cb) => sum + cb.references.length,
    0
  )
  const callbackFrequency =
    jokes.length > 0 ? (totalCallbackReferences / jokes.length) * 100 : 0

  return {
    callbacks,
    metrics: {
      callbackCount: callbacks.length,
      callbackFrequencyPercent: Math.round(callbackFrequency * 10) / 10,
      totalJokes: jokes.length,
      averageCallbacksPerSetup:
        callbacks.length > 0
          ? Math.round((totalCallbackReferences / callbacks.length) * 10) / 10
          : 0,
    },
    missedOpportunities: missedOpportunities.slice(0, 5), // Top 5 opportunities
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()
}

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizeText(text1).split(/\s+/))
  const words2 = new Set(normalizeText(text2).split(/\s+/))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return union.size > 0 ? intersection.size / union.size : 0
}

function determineRelationType(
  setup: string,
  callback: string,
  similarity: number
): CallbackReference['relation'] {
  if (similarity > 0.7) return 'same_punchline_phrase'
  if (similarity > 0.5) return 'thematic_callback'
  if (hasCharacterReference(setup, callback)) return 'character_callback'
  return 'situational_echo'
}

function hasCharacterReference(text1: string, text2: string): boolean {
  // Simple heuristic: check for capitalized words (character names)
  const names1 = text1.match(/\b[A-Z][a-z]+\b/g) || []
  const names2 = text2.match(/\b[A-Z][a-z]+\b/g) || []
  return names1.some(name => names2.includes(name))
}

function hasCallbackPotential(text: string): boolean {
  // Heuristics for strong callback potential
  const indicators = [
    /\b(always|never|every time)\b/i,
    /\b(remember|forgot|mentioned)\b/i,
    /\b(like|just like|similar to)\b/i,
    /["'].*["']/,
  ]
  return indicators.some(pattern => pattern.test(text))
}

function generateCallbackSuggestion(setup: string): string {
  return `Consider referencing this setup in a later scene for comedic payoff. The setup has strong callback potential.`
}

function assessCallbackPotential(
  text: string
): MissedOpportunity['potentialImpact'] {
  if (text.length > 50 && hasCallbackPotential(text)) return 'high'
  if (text.length > 30) return 'medium'
  return 'low'
}

