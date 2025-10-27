// src/pages/CallbacksPage.tsx
// Stage 9: Callback Architecture Mapping UI

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link2, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react'
import { getCallbackAnalysis } from '@/lib/api/callbacks'

interface CallbackSetup {
  line: string
  lineNumber: number
  page: number
  jokeId: string
}

interface CallbackReference {
  lineNumber: number
  page: number
  relation: string
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

export default function CallbacksPage() {
  const { id } = useParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<CallbackAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return

      try {
        setLoading(true)
        const data = await getCallbackAnalysis(id)
        setAnalysis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load callback analysis')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading callback analysis...</div>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Callback Architecture
          </h1>
          <p className="text-gray-300">
            Running gags, repeated jokes, and callback opportunities
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Callback Chains"
            value={analysis.metrics.callbackCount}
            icon={<Link2 className="w-6 h-6" />}
          />
          <MetricCard
            label="Callback Frequency"
            value={`${analysis.metrics.callbackFrequencyPercent}%`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <MetricCard
            label="Total Jokes"
            value={analysis.metrics.totalJokes}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <MetricCard
            label="Avg Callbacks/Setup"
            value={analysis.metrics.averageCallbacksPerSetup}
            icon={<Link2 className="w-6 h-6" />}
          />
        </div>

        {/* Callback Chains */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Identified Callbacks
          </h2>
          {analysis.callbacks.length === 0 ? (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400">
                No callbacks detected. Consider adding running gags or repeated jokes
                to strengthen your script's comedic architecture.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.callbacks.map((callback) => (
                <CallbackCard key={callback.id} callback={callback} />
              ))}
            </div>
          )}
        </div>

        {/* Missed Opportunities */}
        {analysis.missedOpportunities.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              Missed Opportunities
            </h2>
            <div className="space-y-3">
              {analysis.missedOpportunities.map((opportunity, idx) => (
                <MissedOpportunityCard
                  key={idx}
                  opportunity={opportunity}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className="text-blue-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-yellow-400">{value}</div>
    </div>
  )
}

function CallbackCard({ callback }: { callback: CallbackCluster }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start gap-3 mb-4">
        <Link2 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              Running Gag: {callback.setup.line.substring(0, 60)}
              {callback.setup.line.length > 60 ? '...' : ''}
            </h3>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Introduced on page {callback.setup.page}, line {callback.setup.lineNumber}
          </p>

          {/* References */}
          <div className="space-y-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {expanded ? '▼' : '▶'} {callback.references.length} callback
              {callback.references.length !== 1 ? 's' : ''} found
            </button>

            {expanded && (
              <div className="ml-6 space-y-2 mt-3">
                {callback.references.map((ref, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900/50 rounded p-3 border-l-2 border-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">
                        Page {ref.page}, Line {ref.lineNumber}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {ref.relation.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Similarity: {Math.round(ref.similarity * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MissedOpportunityCard({
  opportunity,
}: {
  opportunity: MissedOpportunity
}) {
  const impactColors = {
    high: 'border-red-500 bg-red-900/20',
    medium: 'border-yellow-500 bg-yellow-900/20',
    low: 'border-blue-500 bg-blue-900/20',
  }

  return (
    <div
      className={`rounded-lg p-4 border ${impactColors[opportunity.potentialImpact]}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              {opportunity.potentialImpact} impact
            </span>
            <span className="text-xs text-gray-500">
              Page {opportunity.page}, Line {opportunity.lineNumber}
            </span>
          </div>
          <p className="text-white italic mb-2">
            "{opportunity.setup.substring(0, 100)}
            {opportunity.setup.length > 100 ? '...' : ''}"
          </p>
          <p className="text-gray-400 text-sm">{opportunity.suggestion}</p>
        </div>
      </div>
    </div>
  )
}

