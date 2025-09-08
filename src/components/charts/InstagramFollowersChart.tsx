/**
 * Instagram Followers Chart Component
 * 
 * Specialized chart component for displaying Instagram followers growth over time.
 * Shows historical follower count data with growth trends and targets.
 * Supports different chart types (line, bar, area) and includes growth rate indicators.
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
} from "recharts"
import { ChartDataPoint, generateMetricsSummary, formatMetricValue } from "@/lib/analytics-data"

export type ChartType = "line" | "bar" | "area"

interface InstagramFollowersChartProps {
  data: ChartDataPoint[]
  chartType?: ChartType
  className?: string
  showTargetLine?: boolean
  showGrowthIndicator?: boolean
}

const chartConfig = {
  followers: {
    label: "Followers",
    color: "#3b82f6",
  },
  target: {
    label: "Target",
    color: "#94a3b8",
  },
}

export function InstagramFollowersChart({ 
  data, 
  chartType = "line", 
  className,
  showTargetLine = true,
  showGrowthIndicator = true 
}: InstagramFollowersChartProps) {
  const summary = generateMetricsSummary(data, 7) // 7-day comparison
  
  const renderChart = () => {
    const commonProps = {
      data,
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
              tickFormatter={(value) => formatMetricValue(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                  formatter={(value, name) => [
                    formatMetricValue(Number(value)),
                    name === "value" ? "Followers" : "Target"
                  ]}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-followers)"
              strokeWidth={3}
              dot={{ fill: "var(--color-followers)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            {showTargetLine && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-target)", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            )}
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
              tickFormatter={(value) => formatMetricValue(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="dot"
                  formatter={(value, name) => [
                    formatMetricValue(Number(value)),
                    name === "value" ? "Followers" : "Target"
                  ]}
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-followers)"
              radius={[4, 4, 0, 0]}
            />
            {showTargetLine && (
              <Bar
                dataKey="target"
                fill="var(--color-target)"
                radius={[4, 4, 0, 0]}
              />
            )}
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
              tickFormatter={(value) => formatMetricValue(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                  formatter={(value, name) => [
                    formatMetricValue(Number(value)),
                    name === "value" ? "Followers" : "Target"
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="var(--color-followers)"
              fillOpacity={0.3}
              stroke="var(--color-followers)"
              strokeWidth={3}
            />
            {showTargetLine && (
              <Area
                type="monotone"
                dataKey="target"
                fill="var(--color-target)"
                fillOpacity={0.1}
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        )

      default:
        return null
    }
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Followers Growth
            </h3>
            <p className="text-sm text-gray-500">
              Instagram follower count over time
            </p>
          </div>
          {showGrowthIndicator && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatMetricValue(summary.current)}
              </div>
              <div className={`text-sm font-medium ${
                summary.trend === 'up' ? 'text-green-600' : 
                summary.trend === 'down' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {summary.trend === 'up' ? '↗' : summary.trend === 'down' ? '↘' : '→'} {summary.formatted} from last week
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
            style={{ backgroundColor: "var(--color-followers)" }}
          />
          <span className="text-sm text-gray-600">
            Followers
          </span>
        </div>
        {showTargetLine && (
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: "var(--color-target)" }}
            />
            <span className="text-sm text-gray-600">
              Target
            </span>
          </div>
        )}
      </div>

      {/* Data Summary */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No follower data available</p>
          <p className="text-sm text-gray-400 mt-1">Connect your Instagram account to see analytics</p>
        </div>
      )}
    </div>
  )
} 