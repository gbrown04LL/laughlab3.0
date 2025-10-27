// src/pages/EngagementPage.tsx
// Stage 10: Audience Simulation & Engagement UI

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TrendingUp, TrendingDown, Activity, Star, AlertTriangle } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts'
import { getEngagementData } from '@/lib/api/engagement'

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

export default function EngagementPage() {
  const { id } = useParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<EngagementAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return

      try {
        setLoading(true)
        const data = await getEngagementData(id)
        setAnalysis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load engagement data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading engagement simulation...</div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error || 'No data available'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Audience Engagement Simulation
          </h1>
          <p className="text-gray-300">
            Predicted audience reaction and engagement throughout your script
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Average Engagement"
            value={analysis.metrics.averageEngagement}
            icon={<Activity className="w-6 h-6" />}
            trend="neutral"
          />
          <MetricCard
            label="Peak Engagement"
            value={analysis.metrics.peakEngagement}
            icon={<TrendingUp className="w-6 h-6" />}
            trend="up"
          />
          <MetricCard
            label="Lowest Engagement"
            value={analysis.metrics.lowestEngagement}
            icon={<TrendingDown className="w-6 h-6" />}
            trend="down"
          />
          <MetricCard
            label="Volatility"
            value={analysis.metrics.volatility}
            icon={<Activity className="w-6 h-6" />}
            trend="neutral"
          />
        </div>

        {/* Engagement Curve */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Engagement Curve</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysis.curve}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  label={{ value: 'Script Timeline', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  domain={[0, 10]}
                  label={{ value: 'Engagement Level', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <ReferenceLine y={7.5} stroke="#10b981" strokeDasharray="3 3" label="High" />
                <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="3 3" label="Low" />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#engagementGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>High Engagement (7.5+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Moderate (4.0-7.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Low (&lt;4.0)</span>
            </div>
          </div>
        </div>

        {/* Peak Moments */}
        {analysis.peakMoments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Peak Laughter Moments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.peakMoments.map((peak, idx) => (
                <PeakMomentCard key={idx} peak={peak} rank={idx + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Low Engagement Segments */}
        {analysis.lowEngagementSegments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Low Engagement Segments
            </h2>
            <div className="space-y-3">
              {analysis.lowEngagementSegments.map((segment, idx) => (
                <LowEngagementCard key={idx} segment={segment} />
              ))}
            </div>
          </div>
        )}

        {/* Summary Insights */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-3">Summary</h3>
          <p className="text-gray-300 leading-relaxed">
            {generateSummary(analysis)}
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string
  value: number
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
}) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-blue-400',
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className={trendColors[trend]}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-yellow-400">{value.toFixed(1)}</div>
    </div>
  )
}

function PeakMomentCard({ peak, rank }: { peak: PeakMoment; rank: number }) {
  return (
    <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-lg p-4 border border-yellow-700/50">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-5 h-5 text-yellow-400" />
        <span className="text-yellow-400 font-bold">Peak #{rank}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{peak.score.toFixed(1)}</div>
      <p className="text-gray-300 text-sm mb-2">{peak.description}</p>
      {peak.page && (
        <div className="text-xs text-gray-500">
          Page {peak.page}
          {peak.lineNumber && `, Line ${peak.lineNumber}`}
        </div>
      )}
    </div>
  )
}

function LowEngagementCard({ segment }: { segment: LowEngagementSegment }) {
  return (
    <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400 font-semibold">Low Engagement Period</span>
            <span className="text-xs text-gray-500">{segment.duration}</span>
          </div>
          <p className="text-gray-300 text-sm mb-2">{segment.description}</p>
          <div className="text-xs text-gray-500">
            Average score: {segment.averageScore.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}

function generateSummary(analysis: EngagementAnalysis): string {
  const { metrics, peakMoments, lowEngagementSegments } = analysis

  let summary = `Your script maintains an average engagement level of ${metrics.averageEngagement.toFixed(1)} out of 10. `

  if (peakMoments.length > 0) {
    summary += `The audience is predicted to respond strongest around ${peakMoments[0].description.toLowerCase()}, reaching a peak engagement of ${metrics.peakEngagement.toFixed(1)}. `
  }

  if (lowEngagementSegments.length > 0) {
    summary += `However, there ${lowEngagementSegments.length === 1 ? 'is' : 'are'} ${lowEngagementSegments.length} low engagement segment${lowEngagementSegments.length !== 1 ? 's' : ''} where attention may wane. `
    summary += `Consider adding jokes, callbacks, or plot developments in these areas to maintain audience interest. `
  } else {
    summary += `The engagement remains relatively consistent throughout, with no major lulls detected. `
  }

  if (metrics.volatility > 2.0) {
    summary += `The high volatility (${metrics.volatility.toFixed(1)}) suggests dramatic swings in engagement, which can be effective for comedic timing but may risk losing audience attention during dips.`
  } else {
    summary += `The moderate volatility (${metrics.volatility.toFixed(1)}) indicates a well-paced script with steady comedic momentum.`
  }

  return summary
}

