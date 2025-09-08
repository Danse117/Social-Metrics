/**
 * Analytics Data Transformation Utilities
 * 
 * This file contains utility functions for transforming raw Instagram analytics data
 * into formats suitable for chart components and dashboard displays.
 * Handles data aggregation, time series formatting, and metric calculations.
 */

import { InstagramAnalytics } from '@/lib/social-accounts'

export interface ChartDataPoint {
  date: string
  value: number
  target?: number
  label?: string
  metadata?: Record<string, any>
}

export interface MetricsSummary {
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  formatted: string
}

/**
 * Transform raw analytics data into time series format for charts
 */
export function transformToTimeSeries(
  analyticsData: InstagramAnalytics[],
  metricName: string,
  dateRange: { start: Date; end: Date }
): ChartDataPoint[] {
  const filteredData = analyticsData
    .filter(item => item.metric_name === metricName)
    .filter(item => {
      const itemDate = new Date(item.date_collected)
      return itemDate >= dateRange.start && itemDate <= dateRange.end
    })
    .sort((a, b) => new Date(a.date_collected).getTime() - new Date(b.date_collected).getTime())

  return filteredData.map(item => ({
    date: formatDateForChart(item.date_collected),
    value: extractNumericValue(item.metric_value),
    metadata: item.metric_value
  }))
}

/**
 * Calculate engagement rate from likes, comments, and follower data
 */
export function calculateEngagementRate(
  likes: ChartDataPoint[],
  comments: ChartDataPoint[],
  followers: number
): ChartDataPoint[] {
  if (!likes.length || followers === 0) return []

  return likes.map((likeData, index) => {
    const commentData = comments[index]
    const totalEngagement = likeData.value + (commentData?.value || 0)
    const engagementRate = (totalEngagement / followers) * 100

    return {
      date: likeData.date,
      value: Math.round(engagementRate * 100) / 100, // Round to 2 decimal places
      target: 5.0, // 5% target engagement rate
      metadata: {
        likes: likeData.value,
        comments: commentData?.value || 0,
        total_engagement: totalEngagement,
        followers
      }
    }
  })
}

/**
 * Generate metrics summary with growth calculations
 */
export function generateMetricsSummary(
  data: ChartDataPoint[],
  comparisonPeriodDays: number = 7
): MetricsSummary {
  if (data.length === 0) {
    return {
      current: 0,
      previous: 0,
      change: 0,
      changePercent: 0,
      trend: 'stable',
      formatted: '0%'
    }
  }

  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const current = sortedData[sortedData.length - 1]?.value || 0
  const comparisonIndex = Math.max(0, sortedData.length - comparisonPeriodDays - 1)
  const previous = sortedData[comparisonIndex]?.value || 0

  const change = current - previous
  const changePercent = previous > 0 ? (change / previous) * 100 : 0

  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(changePercent) > 1) { // More than 1% change
    trend = changePercent > 0 ? 'up' : 'down'
  }

  const sign = changePercent > 0 ? '+' : ''
  const formatted = `${sign}${Math.round(changePercent * 100) / 100}%`

  return {
    current,
    previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    trend,
    formatted
  }
}

/**
 * Aggregate media metrics by time period
 */
export function aggregateMediaMetrics(
  analyticsData: InstagramAnalytics[],
  metricNames: string[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): Record<string, ChartDataPoint[]> {
  const result: Record<string, ChartDataPoint[]> = {}

  metricNames.forEach(metricName => {
    const metricData = analyticsData
      .filter(item => item.metric_name === metricName && item.metric_type === 'media')
      .sort((a, b) => new Date(a.date_collected).getTime() - new Date(b.date_collected).getTime())

    const aggregated = aggregateByTimePeriod(metricData, groupBy)
    result[metricName] = aggregated
  })

  return result
}

/**
 * Get top performing posts from media analytics
 */
export function getTopPerformingPosts(
  analyticsData: InstagramAnalytics[],
  limit: number = 10
): Array<{
  media_id: string
  date: string
  likes: number
  comments: number
  shares: number
  saves: number
  total_engagement: number
  engagement_rate: number
}> {
  const mediaGroups: Record<string, any> = {}

  // Group metrics by media_id
  analyticsData
    .filter(item => item.metric_type === 'media' && item.media_id)
    .forEach(item => {
      const mediaId = item.media_id!
      if (!mediaGroups[mediaId]) {
        mediaGroups[mediaId] = {
          media_id: mediaId,
          date: item.date_collected,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0
        }
      }

      const value = extractNumericValue(item.metric_value)
      if (item.metric_name === 'likes') mediaGroups[mediaId].likes = value
      if (item.metric_name === 'comments') mediaGroups[mediaId].comments = value
      if (item.metric_name === 'shares') mediaGroups[mediaId].shares = value
      if (item.metric_name === 'saves') mediaGroups[mediaId].saves = value
    })

  // Calculate engagement metrics and sort
  return Object.values(mediaGroups)
    .map((post: any) => {
      const totalEngagement = post.likes + post.comments + post.shares + post.saves
      return {
        ...post,
        total_engagement: totalEngagement,
        engagement_rate: totalEngagement // Will be calculated against followers in component
      }
    })
    .sort((a, b) => b.total_engagement - a.total_engagement)
    .slice(0, limit)
}

/**
 * Helper function to extract numeric value from metric_value JSONB
 */
function extractNumericValue(metricValue: any): number {
  if (typeof metricValue === 'number') return metricValue
  if (typeof metricValue === 'object' && metricValue !== null) {
    return metricValue.value || metricValue.count || 0
  }
  return 0
}

/**
 * Format date for chart display
 */
function formatDateForChart(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

/**
 * Aggregate data by time period
 */
function aggregateByTimePeriod(
  data: InstagramAnalytics[],
  groupBy: 'day' | 'week' | 'month'
): ChartDataPoint[] {
  const groups: Record<string, number[]> = {}

  data.forEach(item => {
    const date = new Date(item.date_collected)
    let key: string

    switch (groupBy) {
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default: // day
        key = date.toISOString().split('T')[0]
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(extractNumericValue(item.metric_value))
  })

  return Object.entries(groups)
    .map(([dateKey, values]) => ({
      date: formatDateForChart(dateKey),
      value: values.reduce((sum, val) => sum + val, 0) / values.length // Average
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Generate growth rate between two time periods
 */
export function calculateGrowthRate(current: number, previous: number): {
  rate: number
  trend: 'up' | 'down' | 'stable'
  formatted: string
} {
  if (previous === 0) {
    return {
      rate: current > 0 ? 100 : 0,
      trend: current > 0 ? 'up' : 'stable',
      formatted: current > 0 ? '+100%' : '0%'
    }
  }

  const rate = ((current - previous) / previous) * 100
  const trend = Math.abs(rate) < 1 ? 'stable' : (rate > 0 ? 'up' : 'down')
  const sign = rate > 0 ? '+' : ''
  
  return {
    rate: Math.round(rate * 100) / 100,
    trend,
    formatted: `${sign}${Math.round(rate * 100) / 100}%`
  }
}

/**
 * Format large numbers for display (e.g., 1.2K, 1.5M)
 */
export function formatMetricValue(value: number, metricType?: string): string {
  if (metricType === 'engagement' || metricType === 'engagement_rate') {
    return `${value}%`
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
} 