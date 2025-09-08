/**
 * Instagram Engagement Rate Chart Component
 * 
 * Specialized chart component for displaying Instagram engagement rate metrics.
 * Calculates engagement rate from likes, comments, saves divided by followers.
 * Shows trends against industry benchmarks and highlights high/low performing periods.
 */

"use client"

import React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { ChartDataPoint, generateMetricsSummary } from "@/lib/analytics-data"

export type ChartType = "line" | "bar" | "area"

interface InstagramEngagementChartProps {
  data: ChartDataPoint[]
  chartType?: ChartType
  className?: string
  showBenchmark?: boolean
  showGrowthIndicator?: boolean
}

const chartConfig = {
  engagement: {
    label: "Engagement Rate",
    color: "#10b981",
  },
  benchmark: {
    label: "Industry Benchmark",
    color: "#94a3b8",
  },
}

export function InstagramEngagementChart({ 
  data, 
  chartType = "line", 
  className,
  showBenchmark = true,
  showGrowthIndicator = true 
}: InstagramEngagementChartProps) {
  const summary = generateMetricsSummary(data, 7) // 7-day comparison
  const industryBenchmark = 3.5 // 3.5% industry average
  
  // Add benchmark line to data
  const dataWithBenchmark = data.map(item => ({
    ...item,
    benchmark: industryBenchmark
  }))
  
  const renderChart = () => {
    const commonProps = {
      data: dataWithBenchmark,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'dataMax + 1']}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                  formatter={(value, name) => [
                    `${Number(value).toFixed(2)}%`,
                    name === "value" ? "Engagement Rate" : 
                    name === "benchmark" ? "Industry Benchmark" : "Target"
                  ]}
                />
              }
            />
            {showBenchmark && (
                             <ReferenceLine 
                 y={industryBenchmark} 
                 stroke="var(--color-benchmark)" 
                 strokeDasharray="8 4"
                 label={{ value: "Industry Avg" }}
               />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-engagement)"
              strokeWidth={3}
              dot={{ fill: "var(--color-engagement)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        )

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'dataMax + 1']}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="dot"
                  formatter={(value, name) => [
                    `${Number(value).toFixed(2)}%`,
                    name === "value" ? "Engagement Rate" : "Industry Benchmark"
                  ]}
                />
              }
            />
            {showBenchmark && (
              <ReferenceLine 
                y={industryBenchmark} 
                stroke="var(--color-benchmark)" 
                strokeDasharray="8 4"
              />
            )}
            <Bar
              dataKey="value"
              fill="var(--color-engagement)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'dataMax + 1']}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                  formatter={(value, name) => [
                    `${Number(value).toFixed(2)}%`,
                    name === "value" ? "Engagement Rate" : "Industry Benchmark"
                  ]}
                />
              }
            />
            {showBenchmark && (
              <ReferenceLine 
                y={industryBenchmark} 
                stroke="var(--color-benchmark)" 
                strokeDasharray="8 4"
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              fill="var(--color-engagement)"
              fillOpacity={0.3}
              stroke="var(--color-engagement)"
              strokeWidth={3}
            />
          </AreaChart>
        )

      default:
        return null
    }
  }

  const getEngagementStatus = (rate: number) => {
    if (rate >= 6) return { text: "Excellent", color: "text-green-600" }
    if (rate >= 3.5) return { text: "Good", color: "text-blue-600" }
    if (rate >= 2) return { text: "Average", color: "text-yellow-600" }
    return { text: "Needs Improvement", color: "text-red-600" }
  }

  const status = getEngagementStatus(summary.current)

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Engagement Rate
            </h3>
            <p className="text-sm text-gray-500">
              Average engagement across all posts
            </p>
          </div>
          {showGrowthIndicator && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {summary.current.toFixed(1)}%
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${
                  summary.trend === 'up' ? 'text-green-600' : 
                  summary.trend === 'down' ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {summary.trend === 'up' ? '↗' : summary.trend === 'down' ? '↘' : '→'} {summary.formatted}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${status.color} bg-opacity-10`}>
                  {status.text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ChartContainer config={chartConfig} className="h-[300px]">
                 {renderChart() || <div>Chart not available</div>}
       </ChartContainer>
      
      {/* Custom Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "var(--color-engagement)" }}
          />
          <span className="text-sm text-gray-600">
            Engagement Rate
          </span>
        </div>
        {showBenchmark && (
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: "var(--color-benchmark)" }}
            />
            <span className="text-sm text-gray-600">
              Industry Benchmark (3.5%)
            </span>
          </div>
        )}
      </div>

      {/* Engagement Tips */}
      {summary.current < industryBenchmark && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Your engagement rate is below industry average. 
            Try posting more engaging content, use relevant hashtags, and interact with your audience.
          </p>
        </div>
      )}

      {/* Data Summary */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No engagement data available</p>
          <p className="text-sm text-gray-400 mt-1">Post content and connect your Instagram Business account to see engagement analytics</p>
        </div>
      )}
    </div>
  )
} 