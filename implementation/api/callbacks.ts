// src/lib/api/callbacks.ts
// API helper functions for Stage 9: Callback Analysis

import { supabase } from '@/lib/supabase'
import type { Stage9Output } from '@/types/stages'

export async function getCallbackAnalysis(jobId: string): Promise<Stage9Output> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('stage_9_output')
    .eq('id', jobId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch callback analysis: ${error.message}`)
  }

  if (!data?.stage_9_output) {
    throw new Error('Callback analysis not yet available')
  }

  return data.stage_9_output as Stage9Output
}

export async function triggerCallbackAnalysis(jobId: string): Promise<void> {
  const { data: job, error: fetchError } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch job: ${fetchError.message}`)
  }

  // Call the edge function
  const { data, error } = await supabase.functions.invoke('analyze-callbacks', {
    body: {
      jobId,
      scriptText: job.script_text,
      jokes: job.stage_1_output?.jokes || [],
      timeline: job.stage_1_output?.timeline || [],
    },
  })

  if (error) {
    throw new Error(`Callback analysis failed: ${error.message}`)
  }

  return data
}

export async function analyzeCallbacks(
  jobId: string,
  inputs: Record<string, any>
): Promise<Stage9Output> {
  // This function is called from the stage registry
  await triggerCallbackAnalysis(jobId)
  return await getCallbackAnalysis(jobId)
}

export async function getCallbackStatus(jobId: string): Promise<{
  completed: boolean
  completedAt?: string
}> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('stage_9_completed_at')
    .eq('id', jobId)
    .single()

  if (error) {
    throw new Error(`Failed to check callback status: ${error.message}`)
  }

  return {
    completed: !!data.stage_9_completed_at,
    completedAt: data.stage_9_completed_at,
  }
}

