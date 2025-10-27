// supabase/functions/analyze-engagement/index.ts
// Stage 10: Audience Simulation & Engagement

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EngagementPoint {
  position: number
  score: number
  time: string
  page?: number
}

interface PeakMoment {
  position: number
  score: number
  description: string
  page?: number
  lineNumber?: number
}

interface LowEngagementSegment {
  start: number
  end: number
  duration: string
  description: string
  averageScore: number
}

interface EngagementAnalysis {
  curve: EngagementPoint[]
  peakMoments: PeakMoment[]
  lowEngagementSegments: LowEngagementSegment[]
  metrics: {
    averageEngagement: number
    peakEngagement: number
    lowestEngagement: number
    volatility: number
  }
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

    const { jobId, jokes, timeline, gaps } = await req.json()

    if (!jobId || !jokes || !timeline) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build engagement curve
    const engagementAnalysis = buildEngagementCurve(jokes, timeline, gaps)

    // Store results
    const { error: updateError } = await supabaseClient
      .from('analysis_jobs')
      .update({
        stage_10_output: engagementAnalysis,
        stage_10_completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, data: engagementAnalysis }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Engagement analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function buildEngagementCurve(
  jokes: any[],
  timeline: any[],
  gaps?: any[]
): EngagementAnalysis {
  const curve: EngagementPoint[] = []
  const peakMoments: PeakMoment[] = []
  const lowEngagementSegments: LowEngagementSegment[] = []

  // Determine script duration (in minutes or segments)
  const scriptDuration = timeline.length > 0 ? timeline.length : 100
  const segmentSize = Math.max(1, Math.floor(scriptDuration / 50)) // ~50 data points

  // Build engagement curve
  for (let i = 0; i < scriptDuration; i += segmentSize) {
    const segmentEnd = Math.min(i + segmentSize, scriptDuration)
    const segmentJokes = jokes.filter(
      (joke) =>
        joke.position >= i && joke.position < segmentEnd
    )

    // Calculate engagement score for this segment
    let score = 5.0 // Baseline engagement

    // Add points for jokes in this segment
    segmentJokes.forEach((joke) => {
      const jokeWeight = getJokeWeight(joke)
      score += jokeWeight
    })

    // Apply decay from previous jokes
    const decayFactor = calculateDecayFactor(i, jokes)
    score *= decayFactor

    // Cap score at 10
    score = Math.min(10, Math.max(0, score))

    curve.push({
      position: i,
      score: Math.round(score * 10) / 10,
      time: formatTime(i),
      page: Math.floor(i / 10) + 1,
    })
  }

  // Identify peak moments (top 3 highest scores)
  const sortedPoints = [...curve].sort((a, b) => b.score - a.score)
  for (let i = 0; i < Math.min(3, sortedPoints.length); i++) {
    const peak = sortedPoints[i]
    if (peak.score >= 7.5) {
      const nearbyJokes = jokes.filter(
        (j) => Math.abs(j.position - peak.position) < segmentSize
      )
      peakMoments.push({
        position: peak.position,
        score: peak.score,
        description: generatePeakDescription(peak, nearbyJokes),
        page: peak.page,
        lineNumber: nearbyJokes[0]?.lineNumber,
      })
    }
  }

  // Identify low engagement segments (score < 4.0 for extended period)
  let lowSegmentStart: number | null = null
  for (let i = 0; i < curve.length; i++) {
    if (curve[i].score < 4.0) {
      if (lowSegmentStart === null) {
        lowSegmentStart = curve[i].position
      }
    } else {
      if (lowSegmentStart !== null) {
        const duration = curve[i].position - lowSegmentStart
        if (duration >= segmentSize * 2) {
          // At least 2 segments
          const segmentScores = curve
            .filter((p) => p.position >= lowSegmentStart && p.position < curve[i].position)
            .map((p) => p.score)
          const avgScore =
            segmentScores.reduce((sum, s) => sum + s, 0) / segmentScores.length

          lowEngagementSegments.push({
            start: lowSegmentStart,
            end: curve[i].position,
            duration: formatDuration(duration),
            description: generateLowEngagementDescription(lowSegmentStart, curve[i].position),
            averageScore: Math.round(avgScore * 10) / 10,
          })
        }
        lowSegmentStart = null
      }
    }
  }

  // Calculate metrics
  const scores = curve.map((p) => p.score)
  const avgEngagement = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const peakEngagement = Math.max(...scores)
  const lowestEngagement = Math.min(...scores)
  const volatility = calculateVolatility(scores)

  return {
    curve,
    peakMoments,
    lowEngagementSegments,
    metrics: {
      averageEngagement: Math.round(avgEngagement * 10) / 10,
      peakEngagement: Math.round(peakEngagement * 10) / 10,
      lowestEngagement: Math.round(lowestEngagement * 10) / 10,
      volatility: Math.round(volatility * 10) / 10,
    },
  }
}

function getJokeWeight(joke: any): number {
  // Weight jokes based on complexity/quality
  const complexityWeights: Record<string, number> = {
    'High-Complexity': 2.0,
    'Advanced': 1.5,
    'Intermediate': 1.0,
    'Standard': 0.7,
    'Basic': 0.5,
  }
  return complexityWeights[joke.complexity] || 1.0
}

function calculateDecayFactor(position: number, jokes: any[]): number {
  // Find the most recent joke before this position
  const recentJokes = jokes.filter((j) => j.position < position)
  if (recentJokes.length === 0) return 0.8

  const lastJoke = recentJokes[recentJokes.length - 1]
  const timeSinceLastJoke = position - lastJoke.position

  // Decay engagement if too much time has passed without a joke
  if (timeSinceLastJoke > 20) return 0.5
  if (timeSinceLastJoke > 10) return 0.7
  return 1.0
}

function formatTime(position: number): string {
  const minutes = Math.floor(position / 10)
  const seconds = (position % 10) * 6
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 10)
  const seconds = Math.round((duration % 10) * 6)
  if (minutes === 0) return `${seconds} seconds`
  if (seconds === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  return `${minutes}m ${seconds}s`
}

function generatePeakDescription(peak: EngagementPoint, nearbyJokes: any[]): string {
  if (nearbyJokes.length === 0) {
    return `Strong engagement around ${peak.time}`
  }
  const jokeCount = nearbyJokes.length
  return `Big laugh${jokeCount > 1 ? 's' : ''} around ${peak.time} with ${jokeCount} joke${jokeCount !== 1 ? 's' : ''} in quick succession`
}

function generateLowEngagementDescription(start: number, end: number): string {
  const startTime = formatTime(start)
  const endTime = formatTime(end)
  return `Low engagement period from ${startTime} to ${endTime} - consider adding jokes or callbacks here`
}

function calculateVolatility(scores: number[]): number {
  if (scores.length < 2) return 0

  let totalChange = 0
  for (let i = 1; i < scores.length; i++) {
    totalChange += Math.abs(scores[i] - scores[i - 1])
  }

  return totalChange / (scores.length - 1)
}

