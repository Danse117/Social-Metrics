/**
 * Instagram Reach Chart Component
 * 
 * Specialized chart component for displaying Instagram reach and impressions metrics.
 * Shows how many unique accounts saw your content (reach) vs total views (impressions).
 * Includes reach rate calculations and audience growth indicators.
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
  ComposedChart,
} from "recharts"
import { ChartDataPoint, generateMetricsSummary, formatMetricValue } from "@/lib/analytics-data"

export type ChartType = "line" | "bar" | "area" | "composed"

interface InstagramReachChartProps {
  reachData: ChartDataPoint[]
  impressionsData: ChartDataPoint[]
  chartType?: ChartType
  className?: string
  showComparison?: boolean
  showGrowthIndicator?: boolean
}

const chartConfig = {
  reach: {
    label: "Reach",
    color: "#f59e0b",
  },
  impressions: {
    label: "Impressions", 
    color: "#8b5cf6",
  },
  ratio: {
    label: "Reach Rate",
    color: "#06b6d4",
  },
}

export function InstagramReachChart({ 
  reachData,
  impressionsData,
  chartType = "composed", 
  className,
  showComparison = true,
  showGrowthIndicator = true 
}: InstagramReachChartProps) {
  const reachSummary = generateMetricsSummary(reachData, 7)
  const impressionsSummary = generateMetricsSummary(impressionsData, 7)
  
  // Combine reach and impressions data
  const combinedData = reachData.map((reachItem, index) => {
    const impressionItem = impressionsData[index]
    const reachRate = impressionItem?.value > 0 
      ? (reachItem.value / impressionItem.value) * 100 
      : 0
    
    return {
      date: reachItem.date,
      reach: reachItem.value,
      impressions: impressionItem?.value || 0,
      reachRate: Math.round(reachRate * 100) / 100
    }
  })
  
  const renderChart = () => {
    const commonProps = {
      data: combinedData,
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
                    name === "reachRate" ? `${Number(value)}%` : formatMetricValue(Number(value)),
                    name === "reach" ? "Reach" : 
                    name === "impressions" ? "Impressions" : "Reach Rate"
                  ]}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="reach"
              stroke="var(--color-reach)"
              strokeWidth={3}
              dot={{ fill: "var(--color-reach)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            {showComparison && (
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="var(--color-impressions)"
                strokeWidth={2}
                dot={{ fill: "var(--color-impressions)", strokeWidth: 2, r: 3 }}
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
                    name === "reach" ? "Reach" : "Impressions"
                  ]}
                />
              }
            />
            <Bar
              dataKey="reach"
              fill="var(--color-reach)"
              radius={[4, 4, 0, 0]}
            />
            {showComparison && (
              <Bar
                dataKey="impressions"
                fill="var(--color-impressions)"
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
                    name === "reach" ? "Reach" : "Impressions"
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="reach"
              fill="var(--color-reach)"
              fillOpacity={0.3}
              stroke="var(--color-reach)"
              strokeWidth={3}
            />
            {showComparison && (
              <Area
                type="monotone"
                dataKey="impressions"
                fill="var(--color-impressions)"
                fillOpacity={0.2}
                stroke="var(--color-impressions)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        )

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatMetricValue(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                  formatter={(value, name) => [
                    name === "reachRate" ? `${Number(value)}%` : formatMetricValue(Number(value)),
                    name === "reach" ? "Reach" : 
                    name === "impressions" ? "Impressions" : "Reach Rate"
                  ]}
                />
              }
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="impressions"
              fill="var(--color-impressions)"
              fillOpacity={0.2}
              stroke="var(--color-impressions)"
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="reach"
              stroke="var(--color-reach)"
              strokeWidth={3}
              dot={{ fill: "var(--color-reach)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="reachRate"
              stroke="var(--color-ratio)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "var(--color-ratio)", strokeWidth: 2, r: 3 }}
            />
          </ComposedChart>
        )

      default:
        return null
    }
  }

  const avgReachRate = combinedData.length > 0 
    ? combinedData.reduce((sum, item) => sum + item.reachRate, 0) / combinedData.length 
    : 0

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Reach & Impressions
            </h3>
            <p className="text-sm text-gray-500">
              Unique accounts reached vs total content views
            </p>
          </div>
          {showGrowthIndicator && (
            <div className="text-right">
              <div className="flex gap-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatMetricValue(reachSummary.current)}
                  </div>
                  <div className={`text-xs font-medium ${
                    reachSummary.trend === 'up' ? 'text-green-600' : 
                    reachSummary.trend === 'down' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    Reach {reachSummary.formatted}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatMetricValue(impressionsSummary.current)}
                  </div>
                  <div className={`text-xs font-medium ${
                    impressionsSummary.trend === 'up' ? 'text-green-600' : 
                    impressionsSummary.trend === 'down' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    Impressions {impressionsSummary.formatted}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Avg Reach Rate: {avgReachRate.toFixed(1)}%
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
            style={{ backgroundColor: "var(--color-reach)" }}
          />
          <span className="text-sm text-gray-600">
            Reach
          </span>
        </div>
        {showComparison && (
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: "var(--color-impressions)" }}
            />
            <span className="text-sm text-gray-600">
              Impressions
            </span>
          </div>
        )}
        {chartType === "composed" && (
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: "var(--color-ratio)" }}
            />
            <span className="text-sm text-gray-600">
              Reach Rate
            </span>
          </div>
        )}
      </div>

      {/* Insights */}
      {avgReachRate > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            📊 <strong>Insight:</strong> Your content reaches {avgReachRate.toFixed(1)}% unique accounts per impression.
            {avgReachRate < 80 && " Consider optimizing posting times and hashtag strategy to improve reach."}
          </p>
        </div>
      )}

      {/* Data Summary */}
      {reachData.length === 0 && impressionsData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No reach data available</p>
          <p className="text-sm text-gray-400 mt-1">Connect your Instagram Business account to see reach analytics</p>
        </div>
      )}
    </div>
  )
} 