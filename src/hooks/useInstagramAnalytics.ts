/**
 * Instagram Analytics Hook
 * 
 * Custom hook that manages Instagram analytics data fetching and state.
 * Provides real-time analytics data for dashboard charts and metrics.
 * Handles loading states, error handling, and data refresh functionality.
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'

export interface InstagramAnalyticsData {
  profile_metrics: {
    followers: Array<{ date: string; value: number }>
    impressions: Array<{ date: string; value: number }>
    reach: Array<{ date: string; value: number }>
    profile_views: Array<{ date: string; value: number }>
  }
  media_metrics: {
    likes: Array<{ date: string; value: number; media_id?: string }>
    comments: Array<{ date: string; value: number; media_id?: string }>
    shares: Array<{ date: string; value: number; media_id?: string }>
    saves: Array<{ date: string; value: number; media_id?: string }>
  }
  current_stats: {
    followers: number
    following: number
    posts: number
    engagement_rate: number
  }
}

export interface InstagramAccount {
  id: string
  username: string
  display_name: string | null
  platform: string
  account_type: string | null
  avatar_url: string | null
  metadata: Record<string, any>
}

interface UseInstagramAnalyticsOptions {
  accountId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface UseInstagramAnalyticsReturn {
  data: InstagramAnalyticsData | null
  account: InstagramAccount | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
  refreshData: () => Promise<void>
}

export function useInstagramAnalytics(options: UseInstagramAnalyticsOptions = {}): UseInstagramAnalyticsReturn {
  const {
    accountId,
    dateRange,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000 // 5 minutes
  } = options

  const [data, setData] = useState<InstagramAnalyticsData | null>(null)
  const [account, setAccount] = useState<InstagramAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (accountId) params.append('account_id', accountId)
      if (dateRange?.start) params.append('start_date', dateRange.start.toISOString().split('T')[0])
      if (dateRange?.end) params.append('end_date', dateRange.end.toISOString().split('T')[0])
      if (forceRefresh) params.append('force_refresh', 'true')

      const response = await fetch(`/api/analytics/instagram?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }

      setData(result.data)
      setAccount(result.account)
      setLastUpdated(result.last_updated)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching Instagram analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [accountId, dateRange])

  const refreshData = useCallback(async () => {
    await fetchAnalytics(false)
  }, [fetchAnalytics])

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAnalytics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAnalytics])

  return {
    data,
    account,
    loading,
    error,
    lastUpdated,
    refreshData
  }
}

/**
 * Hook for getting formatted chart data for specific metrics
 */
export function useInstagramChartData(
  analytics: InstagramAnalyticsData | null,
  metricType: 'followers' | 'engagement' | 'impressions' | 'reach'
) {
  return useMemo(() => {
    if (!analytics) return []

    switch (metricType) {
      case 'followers':
        return analytics.profile_metrics.followers.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: item.value,
          target: item.value * 1.1 // 10% growth target
        }))

      case 'engagement':
        // Calculate engagement rate from likes and comments
        const likes = analytics.media_metrics.likes
        const comments = analytics.media_metrics.comments
        
        return likes.map((item, index) => {
          const commentCount = comments[index]?.value || 0
          const totalEngagement = item.value + commentCount
          const engagementRate = analytics.current_stats.followers > 0 
            ? (totalEngagement / analytics.current_stats.followers) * 100 
            : 0
          
          return {
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.round(engagementRate * 100) / 100,
            target: 5.0 // 5% target engagement rate
          }
        })

      case 'impressions':
        return analytics.profile_metrics.impressions.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: item.value,
          target: item.value * 1.15 // 15% growth target
        }))

      case 'reach':
        return analytics.profile_metrics.reach.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: item.value,
          target: item.value * 1.12 // 12% growth target
        }))

      default:
        return []
    }
  }, [analytics, metricType])
} 