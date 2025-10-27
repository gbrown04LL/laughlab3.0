// src/lib/stageRegistry.ts
// Stage Registry Pattern for maintainable stage execution

export interface StageConfig {
  id: number
  name: string
  title: string
  description: string
  requiredInputs: string[]
  outputKey: string
  execute: (inputs: Record<string, any>) => Promise<any>
  estimatedDuration?: number // in seconds
  tier?: 'free' | 'pro' | 'expert'
}

export interface StageResult {
  stageId: number
  success: boolean
  data?: any
  error?: string
  duration: number
  timestamp: string
}

class StageRegistry {
  private stages: Map<number, StageConfig> = new Map()

  register(config: StageConfig): void {
    if (this.stages.has(config.id)) {
      throw new Error(`Stage ${config.id} is already registered`)
    }
    this.stages.set(config.id, config)
  }

  get(stageId: number): StageConfig | undefined {
    return this.stages.get(stageId)
  }

  getAll(): StageConfig[] {
    return Array.from(this.stages.values()).sort((a, b) => a.id - b.id)
  }

  getByTier(tier: 'free' | 'pro' | 'expert'): StageConfig[] {
    return this.getAll().filter((stage) => {
      if (!stage.tier) return true // No tier restriction
      if (tier === 'expert') return true // Expert has access to all
      if (tier === 'pro') return stage.tier !== 'expert'
      return stage.tier === 'free'
    })
  }

  async execute(
    stageId: number,
    inputs: Record<string, any>
  ): Promise<StageResult> {
    const stage = this.get(stageId)
    if (!stage) {
      return {
        stageId,
        success: false,
        error: `Stage ${stageId} not found`,
        duration: 0,
        timestamp: new Date().toISOString(),
      }
    }

    // Validate required inputs
    const missingInputs = stage.requiredInputs.filter(
      (input) => !(input in inputs)
    )
    if (missingInputs.length > 0) {
      return {
        stageId,
        success: false,
        error: `Missing required inputs: ${missingInputs.join(', ')}`,
        duration: 0,
        timestamp: new Date().toISOString(),
      }
    }

    const startTime = Date.now()
    try {
      const data = await stage.execute(inputs)
      const duration = Date.now() - startTime

      return {
        stageId,
        success: true,
        data,
        duration,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      const duration = Date.now() - startTime
      return {
        stageId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: new Date().toISOString(),
      }
    }
  }

  async executeSequence(
    stageIds: number[],
    initialInputs: Record<string, any>,
    onProgress?: (stageId: number, result: StageResult) => void
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = { ...initialInputs }

    for (const stageId of stageIds) {
      const result = await this.execute(stageId, results)

      if (onProgress) {
        onProgress(stageId, result)
      }

      if (!result.success) {
        throw new Error(
          `Stage ${stageId} failed: ${result.error}`
        )
      }

      const stage = this.get(stageId)
      if (stage && result.data) {
        results[stage.outputKey] = result.data
      }
    }

    return results
  }
}

// Singleton instance
export const stageRegistry = new StageRegistry()

// Stage registration helper
export function registerStage(config: StageConfig): void {
  stageRegistry.register(config)
}

// Export for testing
export { StageRegistry }

