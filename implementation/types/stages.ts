// src/types/stages.ts
// Extended type definitions for all analysis stages

// Stage 1: Script Parsing & Joke Detection
export interface Joke {
  id: string
  text: string
  lineNumber: number
  page?: number
  position: number
  complexity: 'Basic' | 'Standard' | 'Intermediate' | 'Advanced' | 'High-Complexity'
  type?: string
}

export interface Stage1Output {
  jokes: Joke[]
  timeline: TimelinePoint[]
  scriptMetadata: {
    totalLines: number
    totalPages: number
    estimatedDuration: number
  }
}

// Stage 2: Core Metrics
export interface Stage2Output {
  laughsPerMinute: number
  jokeDensity: number
  totalJokes: number
  averageJokeComplexity: number
}

// Stage 3: Pacing Analysis
export interface Stage3Output {
  pacingScore: number
  rhythm: RhythmPoint[]
  averageTimeBetweenJokes: number
}

export interface RhythmPoint {
  position: number
  intensity: number
  time: string
}

// Stage 4: Laugh Distribution
export interface Stage4Output {
  distribution: DistributionPoint[]
  actBreakdown?: ActBreakdown[]
}

export interface DistributionPoint {
  position: number
  count: number
  page: number
}

export interface ActBreakdown {
  act: number
  jokeCount: number
  percentage: number
}

// Stage 5: Gap Diagnosis
export interface Stage5Output {
  gaps: ComedyGap[]
  retentionCliff: RetentionCliff | null
  gapMetrics: {
    totalGaps: number
    longestGap: number
    averageGapLength: number
  }
}

export interface ComedyGap {
  id: string
  start: number
  end: number
  duration: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: string
}

export interface RetentionCliff {
  position: number
  duration: number
  impactScore: number
  description: string
}

// Stage 6: Targeted Gap Punch-Ups
export interface Stage6Output {
  gapPunchups: Record<string, PunchUpSuggestion[]>
  totalSuggestions: number
}

export interface PunchUpSuggestion {
  id: string
  line: string
  humorType: string
  complexity: string
  confidence?: number
  explanation?: string
}

// Stage 7: Joke Quality Check
export interface Stage7Output {
  jokes: EnrichedJoke[]
  distribution: QualityDistribution
  flaggedCount: number
}

export interface EnrichedJoke extends Joke {
  classificationTier: 'Basic' | 'Standard' | 'Intermediate' | 'Advanced' | 'High'
  flaggedForImprovement: boolean
  improvementSuggestion?: string
  qualityScore?: number
}

export interface QualityDistribution {
  Basic: number
  Standard: number
  Intermediate: number
  Advanced: number
  High: number
}

// Stage 8: Character Analytics
export interface Stage8Output {
  characters: CharacterAnalysis[]
  relationships: RelationshipAnalysis[]
  insights: string
  topComedian?: string
}

export interface CharacterAnalysis {
  name: string
  totalLines: number
  totalJokes: number
  jokePercentage: number
  humorScoreContribution: number
  role?: 'primary_comic' | 'straight_man' | 'supporting' | 'ensemble'
}

export interface RelationshipAnalysis {
  pair: [string, string]
  banterMoments: number
  dynamic: 'straight_man_funny_man' | 'comedic_duo' | 'foil' | 'ensemble'
  description?: string
}

// Stage 9: Callback Architecture
export interface Stage9Output {
  callbacks: CallbackCluster[]
  metrics: CallbackMetrics
  missedOpportunities: MissedOpportunity[]
}

export interface CallbackCluster {
  id: string
  setup: CallbackSetup
  references: CallbackReference[]
}

export interface CallbackSetup {
  line: string
  lineNumber: number
  page: number
  jokeId: string
}

export interface CallbackReference {
  lineNumber: number
  page: number
  relation: 'same_punchline_phrase' | 'situational_echo' | 'character_callback' | 'thematic_callback'
  similarity: number
}

export interface CallbackMetrics {
  callbackCount: number
  callbackFrequencyPercent: number
  totalJokes: number
  averageCallbacksPerSetup: number
}

export interface MissedOpportunity {
  setup: string
  lineNumber: number
  page: number
  suggestion: string
  potentialImpact: 'high' | 'medium' | 'low'
}

// Stage 10: Engagement Simulation
export interface Stage10Output {
  curve: EngagementPoint[]
  peakMoments: PeakMoment[]
  lowEngagementSegments: LowEngagementSegment[]
  metrics: EngagementMetrics
}

export interface EngagementPoint {
  position: number
  score: number
  time: string
  page?: number
}

export interface PeakMoment {
  position: number
  score: number
  description: string
  page?: number
  lineNumber?: number
}

export interface LowEngagementSegment {
  start: number
  end: number
  duration: string
  description: string
  averageScore: number
}

export interface EngagementMetrics {
  averageEngagement: number
  peakEngagement: number
  lowestEngagement: number
  volatility: number
}

// Timeline Point (used across stages)
export interface TimelinePoint {
  position: number
  time: string
  page: number
  hasJoke: boolean
  jokeId?: string
}

// Analysis Job (database model)
export interface AnalysisJob {
  id: string
  user_id: string
  script_text: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  current_stage: number
  
  // Stage outputs
  stage_1_output?: Stage1Output
  stage_2_output?: Stage2Output
  stage_3_output?: Stage3Output
  stage_4_output?: Stage4Output
  stage_5_output?: Stage5Output
  stage_6_output?: Stage6Output
  stage_7_output?: Stage7Output
  stage_8_output?: Stage8Output
  stage_9_output?: Stage9Output
  stage_10_output?: Stage10Output
  
  // Timestamps
  created_at: string
  updated_at: string
  stage_1_completed_at?: string
  stage_2_completed_at?: string
  stage_3_completed_at?: string
  stage_4_completed_at?: string
  stage_5_completed_at?: string
  stage_6_completed_at?: string
  stage_7_completed_at?: string
  stage_8_completed_at?: string
  stage_9_completed_at?: string
  stage_10_completed_at?: string
}

// Helper type for stage execution
export type StageOutput =
  | Stage1Output
  | Stage2Output
  | Stage3Output
  | Stage4Output
  | Stage5Output
  | Stage6Output
  | Stage7Output
  | Stage8Output
  | Stage9Output
  | Stage10Output

