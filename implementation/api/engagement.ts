// src/lib/api/engagement.ts
// API helper functions for Stage 10: Engagement Simulation

import { supabase } from '@/lib/supabase'
import type { Stage10Output } from '@/types/stages'

export async function getEngagementData(jobId: string): Promise<Stage10Output> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('stage_10_output')
    .eq('id', jobId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch engagement data: ${error.message}`)
  }

  if (!data?.stage_10_output) {
    throw new Error('Engagement analysis not yet available')
  }

  return data.stage_10_output as Stage10Output
}

export async function triggerEngagementAnalysis(jobId: string): Promise<void> {
  const { data: job, error: fetchError } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch job: ${fetchError.message}`)
  }

  // Call the edge function
  const { data, error } = await supabase.functions.invoke('analyze-engagement', {
    body: {
      jobId,
      jokes: job.stage_1_output?.jokes || [],
      timeline: job.stage_1_output?.timeline || [],
      gaps: job.stage_5_output?.gaps || [],
    },
  })

  if (error) {
    throw new Error(`Engagement analysis failed: ${error.message}`)
  }

  return data
}

export async function analyzeEngagement(
  jobId: string,
  inputs: Record<string, any>
): Promise<Stage10Output> {
  // This function is called from the stage registry
  await triggerEngagementAnalysis(jobId)
  return await getEngagementData(jobId)
}

export async function getEngagementStatus(jobId: string): Promise<{
  completed: boolean
  completedAt?: string
}> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('stage_10_completed_at')
    .eq('id', jobId)
    .single()

  if (error) {
    throw new Error(`Failed to check engagement status: ${error.message}`)
  }

  return {
    completed: !!data.stage_10_completed_at,
    completedAt: data.stage_10_completed_at,
  }
}

// Utility function to build engagement curve (can be used client-side for preview)
export function buildEngagementCurvePreview(
  jokes: any[],
  timeline: any[]
): Stage10Output['curve'] {
  const curve: Stage10Output['curve'] = []
  const scriptDuration = timeline.length || 100
  const segmentSize = Math.max(1, Math.floor(scriptDuration / 50))

  for (let i = 0; i < scriptDuration; i += segmentSize) {
    const segmentEnd = Math.min(i + segmentSize, scriptDuration)
    const segmentJokes = jokes.filter(
      (joke) => joke.position >= i && joke.position < segmentEnd
    )

    let score = 5.0
    segmentJokes.forEach((joke) => {
      const weight = joke.complexity === 'High-Complexity' ? 2.0 : 1.0
      score += weight
    })

    score = Math.min(10, Math.max(0, score))

    curve.push({
      position: i,
      score: Math.round(score * 10) / 10,
      time: `${Math.floor(i / 10)}:${((i % 10) * 6).toString().padStart(2, '0')}`,
      page: Math.floor(i / 10) + 1,
    })
  }

  return curve
}

