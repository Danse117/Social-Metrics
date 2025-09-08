/**
 * Instagram Media Performance Chart Component
 * 
 * Specialized chart component for displaying individual Instagram post performance.
 * Shows metrics like likes, comments, saves, and shares for recent posts.
 * Helps identify top-performing content and engagement patterns.
 */

"use client"

import React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"
import { formatMetricValue } from "@/lib/analytics-data"

export type MediaChartType = "bar" | "scatter"

interface PostPerformanceData {
  media_id: string
  date: string
  likes: number
  comments: number
  shares: number
  saves: number
  total_engagement: number
  engagement_rate: number
  post_title?: string
  media_type?: string
}

interface InstagramMediaPerformanceChartProps {
  data: PostPerformanceData[]
  chartType?: MediaChartType
  className?: string
  showEngagementRate?: boolean
  maxPosts?: number
}

const chartConfig = {
  likes: {
    label: "Likes",
    color: "#ef4444",
  },
  comments: {
    label: "Comments",
    color: "#3b82f6",
  },
  shares: {
    label: "Shares",
    color: "#10b981",
  },
  saves: {
    label: "Saves",
    color: "#8b5cf6",
  },
  engagement_rate: {
    label: "Engagement Rate",
    color: "#f59e0b",
  },
}

export function InstagramMediaPerformanceChart({ 
  data,
  chartType = "bar", 
  className,
  showEngagementRate = true,
  maxPosts = 10
}: InstagramMediaPerformanceChartProps) {
  
  // Sort by total engagement and limit
  const sortedData = [...data]
    .sort((a, b) => b.total_engagement - a.total_engagement)
    .slice(0, maxPosts)
    .map((post, index) => ({
      ...post,
      post_number: `Post ${index + 1}`,
      short_date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  
  const renderChart = () => {
    const commonProps = {
      data: sortedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="post_number"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatMetricValue(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="dot"
                  formatter={(value, name) => [
                    formatMetricValue(Number(value)),
                    name === "likes" ? "Likes" :
                    name === "comments" ? "Comments" :
                    name === "shares" ? "Shares" : "Saves"
                  ]}
                />
              }
            />
            <Bar
              dataKey="likes"
              stackId="engagement"
              fill="var(--color-likes)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="comments"
              stackId="engagement"
              fill="var(--color-comments)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="shares"
              stackId="engagement"
              fill="var(--color-shares)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="saves"
              stackId="engagement"
              fill="var(--color-saves)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              dataKey="likes"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatMetricValue(value)}
              name="Likes"
            />
            <YAxis
              type="number"
              dataKey="comments"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatMetricValue(value)}
              name="Comments"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  formatter={(value, name, props) => [
                    formatMetricValue(Number(value)),
                    name === "likes" ? "Likes" : "Comments"
                  ]}
                  labelFormatter={(label, payload) => {
                    const post = payload?.[0]?.payload
                    return post ? `${post.post_number} (${post.short_date})` : label
                  }}
                />
              }
            />
            <Scatter
              dataKey="comments"
              fill="var(--color-comments)"
            />
          </ScatterChart>
        )

      default:
        return null
    }
  }

  const topPost = sortedData[0]
  const avgEngagement = sortedData.length > 0
    ? sortedData.reduce((sum, post) => sum + post.total_engagement, 0) / sortedData.length
    : 0

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Post Performance
            </h3>
            <p className="text-sm text-gray-500">
              Individual post engagement metrics
            </p>
          </div>
          {topPost && (
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatMetricValue(topPost.total_engagement)}
              </div>
              <div className="text-sm text-gray-500">
                Top post engagement
              </div>
              <div className="text-xs text-gray-400">
                {topPost.short_date}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ChartContainer config={chartConfig} className="h-[300px]">
        {renderChart() || <div>Chart not available</div>}
      </ChartContainer>
      
      {/* Custom Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "var(--color-likes)" }}
          />
          <span className="text-sm text-gray-600">Likes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "var(--color-comments)" }}
          />
          <span className="text-sm text-gray-600">Comments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "var(--color-shares)" }}
          />
          <span className="text-sm text-gray-600">Shares</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "var(--color-saves)" }}
          />
          <span className="text-sm text-gray-600">Saves</span>
        </div>
      </div>

      {/* Performance Insights */}
      {avgEngagement > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900">
              Average Engagement
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatMetricValue(avgEngagement)}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900">
              Posts Analyzed
            </div>
            <div className="text-lg font-bold text-green-600">
              {sortedData.length}
            </div>
          </div>
        </div>
      )}

      {/* Data Summary */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No post performance data available</p>
          <p className="text-sm text-gray-400 mt-1">Create posts and connect your Instagram Business account to see performance analytics</p>
        </div>
      )}
    </div>
  )
} 