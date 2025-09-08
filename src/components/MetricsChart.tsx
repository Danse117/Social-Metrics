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

export type ChartType = "line" | "bar" | "area"
export type MetricType = "followers" | "engagement" | "impressions" | "reach"

interface MetricsChartProps {
  chartType: ChartType
  metricType: MetricType
  className?: string
  data?: Array<{ date: string; value: number; target?: number }>
  loading?: boolean
}

// Sample data for different metrics
const sampleData = {
  followers: [
    { date: "Jan", value: 1200, target: 1000 },
    { date: "Feb", value: 1350, target: 1100 },
    { date: "Mar", value: 1420, target: 1200 },
    { date: "Apr", value: 1580, target: 1300 },
    { date: "May", value: 1720, target: 1400 },
    { date: "Jun", value: 1890, target: 1500 },
  ],
  engagement: [
    { date: "Jan", value: 3.2, target: 3.0 },
    { date: "Feb", value: 3.8, target: 3.2 },
    { date: "Mar", value: 4.1, target: 3.5 },
    { date: "Apr", value: 4.5, target: 3.8 },
    { date: "May", value: 4.8, target: 4.0 },
    { date: "Jun", value: 5.2, target: 4.2 },
  ],
  impressions: [
    { date: "Jan", value: 8500, target: 8000 },
    { date: "Feb", value: 9200, target: 8500 },
    { date: "Mar", value: 10100, target: 9000 },
    { date: "Apr", value: 11200, target: 9500 },
    { date: "May", value: 12400, target: 10000 },
    { date: "Jun", value: 13800, target: 10500 },
  ],
  reach: [
    { date: "Jan", value: 4200, target: 4000 },
    { date: "Feb", value: 4600, target: 4200 },
    { date: "Mar", value: 5100, target: 4500 },
    { date: "Apr", value: 5700, target: 4800 },
    { date: "May", value: 6300, target: 5200 },
    { date: "Jun", value: 6900, target: 5500 },
  ],
}

const chartConfig = {
  followers: {
    value: {
      label: "Followers",
      color: "#3b82f6",
    },
    target: {
      label: "Target",
      color: "#94a3b8",
    },
  },
  engagement: {
    value: {
      label: "Engagement Rate",
      color: "#10b981",
    },
    target: {
      label: "Target",
      color: "#94a3b8",
    },
  },
  impressions: {
    value: {
      label: "Impressions",
      color: "#8b5cf6",
    },
    target: {
      label: "Target",
      color: "#94a3b8",
    },
  },
  reach: {
    value: {
      label: "Reach",
      color: "#f59e0b",
    },
    target: {
      label: "Target",
      color: "#94a3b8",
    },
  },
}

export function MetricsChart({ 
  chartType, 
  metricType, 
  className, 
  data: providedData,
  loading = false 
}: MetricsChartProps) {
  const data = providedData || sampleData[metricType]
  const config = chartConfig[metricType]
  
  if (loading) {
    return (
      <div className={className}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {metricType.replace(/([A-Z])/g, " $1").trim()} Metrics
          </h3>
          <p className="text-sm text-gray-500">Loading data...</p>
        </div>
        <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data}>
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
              tickFormatter={(value) => {
                if (metricType === "engagement") {
                  return `${value}%`
                }
                return value.toLocaleString()
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-target)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "var(--color-target)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        )

      case "bar":
        return (
          <BarChart data={data}>
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
              tickFormatter={(value) => {
                if (metricType === "engagement") {
                  return `${value}%`
                }
                return value.toLocaleString()
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="target"
              fill="var(--color-target)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      case "area":
        return (
          <AreaChart data={data}>
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
              tickFormatter={(value) => {
                if (metricType === "engagement") {
                  return `${value}%`
                }
                return value.toLocaleString()
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.3}
              stroke="var(--color-value)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="target"
              fill="var(--color-target)"
              fillOpacity={0.1}
              stroke="var(--color-target)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        )

      default:
        return (
          <LineChart data={data}>
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
              tickFormatter={(value) => {
                if (metricType === "engagement") {
                  return `${value}%`
                }
                return value.toLocaleString()
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  indicator="line"
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-target)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "var(--color-target)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        )
    }
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {metricType.replace(/([A-Z])/g, " $1").trim()} Metrics
        </h3>
        <p className="text-sm text-gray-500">
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing {metricType} over time
        </p>
      </div>
      
      <ChartContainer config={config} className="h-[300px]">
        {renderChart()}
      </ChartContainer>
      
      {/* Custom Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "var(--color-value)" }}
          />
          <span className="text-sm text-gray-600">
            {config.value.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "var(--color-target)" }}
          />
          <span className="text-sm text-gray-600">
            {config.target.label}
          </span>
        </div>
      </div>
    </div>
  )
} 