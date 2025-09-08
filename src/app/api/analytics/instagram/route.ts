/**
 * Instagram Analytics API Endpoint
 * 
 * This endpoint fetches Instagram analytics data for the authenticated user's connected accounts.
 * It retrieves data from the instagram_analytics table and formats it for dashboard consumption.
 * Supports filtering by date range, metric type, and specific social account.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { getInstagramAnalytics, getSocialAccounts } from '@/lib/social-accounts'

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')
    const metricType = searchParams.get('metric_type') as 'profile' | 'media' | null
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const forceRefresh = searchParams.get('force_refresh') === 'true'

    // Get user's social accounts to verify ownership
    const socialAccounts = await getSocialAccounts(user.id)
    const targetAccount = accountId 
      ? socialAccounts.find(account => account.id === accountId)
      : socialAccounts.find(account => account.platform === 'instagram' && account.is_active)

    if (!targetAccount || targetAccount.platform !== 'instagram') {
      return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 })
    }

    // Parse date range
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate)
    } : {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }

    // Get analytics data from database
    let analyticsData = await getInstagramAnalytics(
      targetAccount.id,
      metricType || undefined,
      dateRange
    )

    // Data is fetched from database only

    // Format data for charts
    const formattedData = formatAnalyticsForCharts(analyticsData, targetAccount)

    return NextResponse.json({
      data: formattedData,
      account: {
        id: targetAccount.id,
        username: targetAccount.username,
        display_name: targetAccount.display_name,
        platform: targetAccount.platform,
        account_type: targetAccount.account_type,
        avatar_url: targetAccount.avatar_url,
        metadata: targetAccount.metadata
      },
      date_range: dateRange,
      last_updated: analyticsData[0]?.created_at || null
    })

  } catch (error) {
    console.error('Error fetching Instagram analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}



/**
 * Format analytics data for chart consumption
 */
function formatAnalyticsForCharts(analyticsData: any[], account: any) {
  const groupedData: Record<string, any[]> = {}
  
  // Group by metric name
  analyticsData.forEach(item => {
    if (!groupedData[item.metric_name]) {
      groupedData[item.metric_name] = []
    }
    groupedData[item.metric_name].push({
      date: item.date_collected,
      value: item.metric_value.value || 0,
      ...item.metric_value
    })
  })

  // Sort each metric by date
  Object.keys(groupedData).forEach(key => {
    groupedData[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  return {
    profile_metrics: {
      followers: groupedData['follower_count'] || [],
      impressions: groupedData['impressions'] || [],
      reach: groupedData['reach'] || [],
      profile_views: groupedData['profile_views'] || []
    },
    media_metrics: {
      likes: groupedData['likes'] || [],
      comments: groupedData['comments'] || [],
      shares: groupedData['shares'] || [],
      saves: groupedData['saves'] || []
    },
    current_stats: {
      followers: account.metadata?.followers_count || 0,
      following: account.metadata?.follows_count || 0,
      posts: account.metadata?.media_count || 0,
      engagement_rate: calculateEngagementRate(groupedData)
    }
  }
}

/**
 * Calculate average engagement rate from recent posts
 */
function calculateEngagementRate(groupedData: Record<string, any[]>) {
  const likes = groupedData['likes'] || []
  const comments = groupedData['comments'] || []
  
  if (likes.length === 0) return 0
  
  const totalEngagement = likes.reduce((sum, item, index) => {
    const commentCount = comments[index]?.value || 0
    return sum + item.value + commentCount
  }, 0)
  
  const avgEngagement = totalEngagement / likes.length
  // Assuming average reach of 10% of followers for engagement rate calculation
  return avgEngagement > 0 ? (avgEngagement / 1000) * 100 : 0 // Simplified calculation
} 