"use client"

import React, { useState } from "react"
import Navbar from "@/components/Navbar"
import { ProfileSidebar } from "@/components/ProfileSidebar"
import { MetricsChart } from "@/components/MetricsChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Footer from "@/components/Footer"

// Sample profile data
const sampleProfiles = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    platform: "Twitter",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    platform: "Instagram",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    platform: "LinkedIn",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    platform: "Facebook",
  },
]

// Sample metrics data for overview cards
const getMetricsOverview = (profileId: string) => {
  const baseMetrics = {
    "1": { followers: 1890, engagement: 5.2, impressions: 13800, reach: 6900 },
    "2": { followers: 2340, engagement: 4.8, impressions: 15600, reach: 8200 },
    "3": { followers: 1560, engagement: 6.1, impressions: 9800, reach: 5400 },
    "4": { followers: 3120, engagement: 3.9, impressions: 18900, reach: 9800 },
  }
  
  return baseMetrics[profileId as keyof typeof baseMetrics] || baseMetrics["1"]
}

export default function DashboardClient() {
  const [activeProfileId, setActiveProfileId] = useState("1")
  const [selectedChartType, setSelectedChartType] = useState<"line" | "bar" | "area">("line")

  const handleProfileSwitch = (profileId: string) => {
    setActiveProfileId(profileId)
  }

  const activeProfile = sampleProfiles.find(p => p.id === activeProfileId)
  const metrics = getMetricsOverview(activeProfileId)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-col flex-1">

      <div className="flex flex-1 px-10 py-5 fixed">
        <ProfileSidebar
          profiles={sampleProfiles}
          activeProfileId={activeProfileId}
          onProfileSwitch={handleProfileSwitch}
        />
        </div>
        {/* Main Dashboard Content */}
        <div className="flex-1 ml-20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Analytics for {activeProfile?.name} on {activeProfile?.platform}
              </p>
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
                    {metrics.followers.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +12% from last month
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
                    {metrics.engagement}%
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +8% from last month
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
                    {metrics.impressions.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +15% from last month
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
                    {metrics.reach.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +10% from last month
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

            {/* Recent Activity Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates for {activeProfile?.name}
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