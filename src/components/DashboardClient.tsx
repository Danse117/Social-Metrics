"use client"

import React, { useState } from "react"
import Navbar from "@/components/Navbar"
import { ProfileSidebar } from "@/components/ProfileSidebar"
import { MetricsChart } from "@/components/MetricsChart"
import { InstagramFollowersChart } from "@/components/charts/InstagramFollowersChart"
import { InstagramEngagementChart } from "@/components/charts/InstagramEngagementChart"
import { InstagramReachChart } from "@/components/charts/InstagramReachChart"
import { InstagramMediaPerformanceChart } from "@/components/charts/InstagramMediaPerformanceChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Footer from "@/components/Footer"
import { useSocialAccounts } from "@/hooks/useSocialAccounts"
import { useInstagramAnalytics, useInstagramChartData } from "@/hooks/useInstagramAnalytics"
import { formatMetricValue, calculateGrowthRate, getTopPerformingPosts } from "@/lib/analytics-data"

// Get real metrics overview from Instagram analytics data
const getMetricsOverview = (analyticsData: any, accountMetadata: any) => {
  const defaultMetrics = { 
    followers: 0, 
    engagement: 0, 
    impressions: 0, 
    reach: 0,
    followersGrowth: '+0%',
    engagementGrowth: '+0%',
    impressionsGrowth: '+0%',
    reachGrowth: '+0%'
  }
  
  if (!analyticsData) return defaultMetrics
  
  // Get current stats and calculate growth
  const current = analyticsData.current_stats
  const profileMetrics = analyticsData.profile_metrics
  
  // Calculate growth rates for each metric
  const followersGrowth = profileMetrics.followers.length > 1 
    ? calculateGrowthRate(
        profileMetrics.followers[profileMetrics.followers.length - 1]?.value || current.followers,
        profileMetrics.followers[Math.max(0, profileMetrics.followers.length - 8)]?.value || current.followers
      )
    : { formatted: '+0%' }
    
  const impressionsGrowth = profileMetrics.impressions.length > 1
    ? calculateGrowthRate(
        profileMetrics.impressions[profileMetrics.impressions.length - 1]?.value || 0,
        profileMetrics.impressions[Math.max(0, profileMetrics.impressions.length - 8)]?.value || 0
      )
    : { formatted: '+0%' }
    
  const reachGrowth = profileMetrics.reach.length > 1
    ? calculateGrowthRate(
        profileMetrics.reach[profileMetrics.reach.length - 1]?.value || 0,
        profileMetrics.reach[Math.max(0, profileMetrics.reach.length - 8)]?.value || 0
      )
    : { formatted: '+0%' }
  
  return {
    followers: current.followers || accountMetadata?.followers_count || 0,
    engagement: current.engagement_rate || 0,
    impressions: profileMetrics.impressions[profileMetrics.impressions.length - 1]?.value || 0,
    reach: profileMetrics.reach[profileMetrics.reach.length - 1]?.value || 0,
    followersGrowth: followersGrowth.formatted,
    engagementGrowth: current.engagement_rate > 0 ? '+0.2%' : '+0%', // Placeholder
    impressionsGrowth: impressionsGrowth.formatted,
    reachGrowth: reachGrowth.formatted
  }
}

// Transform Instagram analytics data for media performance chart
const transformMediaDataForChart = (analyticsData: any) => {
  if (!analyticsData?.media_metrics) return []
  
  const { likes, comments, shares, saves } = analyticsData.media_metrics
  
  // Group by media_id to get per-post metrics
  const mediaGroups: Record<string, any> = {}
  
  // Process likes data
  likes.forEach((item: any) => {
    if (item.media_id) {
      if (!mediaGroups[item.media_id]) {
        mediaGroups[item.media_id] = {
          media_id: item.media_id,
          date: item.date,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0
        }
      }
      mediaGroups[item.media_id].likes = item.value
    }
  })
  
  // Process other metrics
  comments.forEach((item: any) => {
    if (item.media_id && mediaGroups[item.media_id]) {
      mediaGroups[item.media_id].comments = item.value
    }
  })
  
  shares.forEach((item: any) => {
    if (item.media_id && mediaGroups[item.media_id]) {
      mediaGroups[item.media_id].shares = item.value
    }
  })
  
  saves.forEach((item: any) => {
    if (item.media_id && mediaGroups[item.media_id]) {
      mediaGroups[item.media_id].saves = item.value
    }
  })
  
  // Calculate totals and return sorted by engagement
  return Object.values(mediaGroups).map((post: any) => ({
    ...post,
    total_engagement: post.likes + post.comments + post.shares + post.saves,
    engagement_rate: 0 // Will be calculated in component
  }))
}

export default function DashboardClient() {
  const [selectedChartType, setSelectedChartType] = useState<"line" | "bar" | "area">("line")
  const { 
    socialAccounts, 
    loading, 
    error, 
    activeAccount, 
    setActiveAccount,
    refreshAccounts
  } = useSocialAccounts()

  // Get Instagram analytics data for the active account
  const { 
    data: analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError
  } = useInstagramAnalytics({
    accountId: activeAccount?.id,
    autoRefresh: true
  })

  // Pre-compute chart data to avoid conditional hook calls
  const followersChartData = useInstagramChartData(analyticsData, 'followers')
  const engagementChartData = useInstagramChartData(analyticsData, 'engagement')
  const impressionsChartData = useInstagramChartData(analyticsData, 'impressions')
  const reachChartData = useInstagramChartData(analyticsData, 'reach')

  const handleAccountSwitch = (accountId: string) => {
    setActiveAccount(accountId)
  }

  const handleAddAccount = () => {
    // Additional logic when adding account if needed
  }

  const metrics = getMetricsOverview(analyticsData, activeAccount?.metadata)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />
      <div className="flex flex-col flex-1">

      <div className="flex flex-1 px-10 py-5 fixed">
        <div className="z-[9999]">
        <ProfileSidebar
          socialAccounts={socialAccounts}
          activeAccountId={activeAccount?.id}
          onAccountSwitch={handleAccountSwitch}
          onAddAccount={handleAddAccount}
        />
        </div>

        </div>
        {/* Main Dashboard Content */}
        <div className="flex-1 ml-20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dashboard
                  </h1>
                  {activeAccount ? (
                    <p className="text-gray-600">
                      Analytics for {activeAccount.display_name || activeAccount.username} on {activeAccount.platform}
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      Connect a social media account to view analytics
                    </p>
                  )}
                </div>

              </div>
              {analyticsError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ⚠️ Error loading analytics: {analyticsError}
                  </p>
                </div>
              )}
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Followers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatMetricValue(metrics.followers)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {metrics.followersGrowth} from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Engagement Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.engagement.toFixed(1)}%
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {metrics.engagementGrowth} from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatMetricValue(metrics.impressions)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {metrics.impressionsGrowth} from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatMetricValue(metrics.reach)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {metrics.reachGrowth} from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart Controls */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Analytics Charts
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant={selectedChartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChartType("line")}
                  >
                    Line
                  </Button>
                  <Button
                    variant={selectedChartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChartType("bar")}
                  >
                    Bar
                  </Button>
                  <Button
                    variant={selectedChartType === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChartType("area")}
                  >
                    Area
                  </Button>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            {activeAccount?.platform === 'instagram' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    {analyticsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="text-gray-500">Loading followers data...</div>
                      </div>
                    ) : (
                      <InstagramFollowersChart
                        data={followersChartData}
                        chartType={selectedChartType}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    {analyticsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="text-gray-500">Loading engagement data...</div>
                      </div>
                    ) : (
                      <InstagramEngagementChart
                        data={engagementChartData}
                        chartType={selectedChartType}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    {analyticsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="text-gray-500">Loading reach data...</div>
                      </div>
                    ) : (
                      <InstagramReachChart
                        reachData={reachChartData}
                        impressionsData={impressionsChartData}
                        chartType={selectedChartType === "line" ? "composed" : selectedChartType}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    {analyticsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="text-gray-500">Loading post data...</div>
                      </div>
                    ) : (
                      <InstagramMediaPerformanceChart
                        data={analyticsData ? transformMediaDataForChart(analyticsData) : []}
                        chartType="bar"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Fallback to generic charts for non-Instagram accounts
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <MetricsChart
                      chartType={selectedChartType}
                      metricType="followers"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <MetricsChart
                      chartType={selectedChartType}
                      metricType="engagement"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <MetricsChart
                      chartType={selectedChartType}
                      metricType="impressions"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <MetricsChart
                      chartType={selectedChartType}
                      metricType="reach"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    {activeAccount 
                      ? `Latest updates for ${activeAccount.display_name || activeAccount.username}`
                      : 'Connect an account to view activity'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          New follower milestone reached
                        </p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          High engagement post detected
                        </p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Weekly report generated
                        </p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
      </div>
      {/* Footer */}
      <div className="flex justify-center items-center">
        <Footer 
          logo={{
            url: "/",
            src: "/social-metrics-logo.png",
            alt: "SocialMetrics Logo",
            title: "SocialMetrics"
          }}
          description="Comprehensive social media analytics and insights platform to help you grow your online presence."
          sections={[
            {
              title: "Analytics",
              links: [
                { name: "Dashboard", href: "/" },
                { name: "Reports", href: "/reports" },
                { name: "Insights", href: "/insights" },
                { name: "Competitor Analysis", href: "/competitor" },
              ],
            },
            {
              title: "Tools",
              links: [
                { name: "Content Scheduler", href: "/scheduler" },
                { name: "Performance Tracking", href: "/tracking" },
                { name: "Audience Analytics", href: "/audience" },
                { name: "Campaign Manager", href: "/campaigns" },
              ],
            },
            {
              title: "Support",
              links: [
                { name: "Help Center", href: "/help" },
                { name: "API Documentation", href: "/docs" },
                { name: "Contact Us", href: "/contact" },
                { name: "Community", href: "/community" },
              ],
            },
          ]}
          copyright="© 2024 SocialMetrics. All rights reserved."
          legalLinks={[
            { name: "Terms of Service", href: "/terms" },
            { name: "Privacy Policy", href: "/privacy" },
          ]}
        />
      </div>
      </div>
  )
} 