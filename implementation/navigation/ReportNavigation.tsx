// src/components/ReportNavigation.tsx
// Dynamic Navigation with Stage Status Indicators

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type StageStatus = 'completed' | 'running' | 'pending' | 'locked' | 'error'

export interface NavigationStage {
  id: number
  path: string
  title: string
  shortTitle?: string
  status: StageStatus
  tier?: 'free' | 'pro' | 'expert'
  errorMessage?: string
}

interface ReportNavigationProps {
  reportId: string
  stages: NavigationStage[]
  currentStage?: number
  userTier: 'free' | 'pro' | 'expert'
  onStageClick?: (stageId: number) => void
}

export default function ReportNavigation({
  reportId,
  stages,
  currentStage,
  userTier,
  onStageClick,
}: ReportNavigationProps) {
  const location = useLocation()

  const getStageIcon = (stage: NavigationStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStageStyles = (stage: NavigationStage) => {
    const isActive = location.pathname.includes(stage.path)
    const isCurrent = currentStage === stage.id

    const baseStyles =
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200'

    if (stage.status === 'locked') {
      return cn(baseStyles, 'opacity-50 cursor-not-allowed bg-gray-800/30')
    }

    if (stage.status === 'error') {
      return cn(
        baseStyles,
        'bg-red-900/20 border border-red-700/50 hover:bg-red-900/30'
      )
    }

    if (isActive || isCurrent) {
      return cn(
        baseStyles,
        'bg-blue-600/30 border border-blue-500/50 text-white font-semibold'
      )
    }

    if (stage.status === 'completed') {
      return cn(
        baseStyles,
        'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
      )
    }

    if (stage.status === 'running') {
      return cn(
        baseStyles,
        'bg-blue-900/30 border border-blue-700/50 animate-pulse'
      )
    }

    return cn(
      baseStyles,
      'bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50'
    )
  }

  const canAccessStage = (stage: NavigationStage): boolean => {
    if (!stage.tier) return true
    if (userTier === 'expert') return true
    if (userTier === 'pro') return stage.tier !== 'expert'
    return stage.tier === 'free'
  }

  const handleStageClick = (stage: NavigationStage) => {
    if (stage.status === 'locked' || !canAccessStage(stage)) {
      return
    }
    if (onStageClick) {
      onStageClick(stage.id)
    }
  }

  // Calculate progress
  const completedStages = stages.filter((s) => s.status === 'completed').length
  const totalStages = stages.filter((s) => canAccessStage(s)).length
  const progressPercent = (completedStages / totalStages) * 100

  return (
    <nav className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Analysis Progress
          </span>
          <span className="text-sm font-medium text-blue-400">
            {completedStages} / {totalStages}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stage List */}
      <div className="space-y-2">
        {stages.map((stage) => {
          const isAccessible = canAccessStage(stage)
          const isClickable =
            isAccessible && stage.status !== 'locked' && stage.status !== 'pending'

          const content = (
            <div className={getStageStyles(stage)}>
              <div className="flex-shrink-0">{getStageIcon(stage)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {stage.shortTitle || stage.title}
                </div>
                {stage.status === 'running' && (
                  <div className="text-xs text-blue-400 mt-1">Processing...</div>
                )}
                {stage.status === 'error' && stage.errorMessage && (
                  <div className="text-xs text-red-400 mt-1">
                    {stage.errorMessage}
                  </div>
                )}
                {!isAccessible && (
                  <div className="text-xs text-gray-500 mt-1">
                    {stage.tier === 'pro' ? 'Pro' : 'Expert'} tier required
                  </div>
                )}
              </div>
              {stage.status === 'completed' && (
                <div className="flex-shrink-0 text-xs text-gray-500">
                  View →
                </div>
              )}
            </div>
          )

          if (isClickable && stage.status === 'completed') {
            return (
              <Link
                key={stage.id}
                to={`/report/${reportId}${stage.path}`}
                onClick={() => handleStageClick(stage)}
              >
                {content}
              </Link>
            )
          }

          return (
            <div
              key={stage.id}
              onClick={() => handleStageClick(stage)}
              className={isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
            >
              {content}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-400" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-600" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span>Locked (Upgrade Required)</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

