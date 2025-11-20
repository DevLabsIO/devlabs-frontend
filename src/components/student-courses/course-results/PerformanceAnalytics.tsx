"use client";

import type React from "react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface PieChartData {
  category: string;
  count: number;
  fill: string;
}

interface BarChartData {
  reviewName: string;
  score: number;
}

interface PerformanceAnalyticsProps {
  pieChartData: PieChartData[];
  barChartData: BarChartData[];
}

// Professional color scheme for performance grades
const performanceChartConfig = {
  count: {
    label: "Reviews",
  },
  excellent: {
    label: "Excellent (85-100%)",
    color: "#10b981", // Emerald green - success
  },
  good: {
    label: "Good (70-84%)",
    color: "#22c55e", // Green - good performance
  },
  average: {
    label: "Average (55-69%)",
    color: "#f59e0b", // Amber - needs attention
  },
  poor: {
    label: "Poor (0-54%)",
    color: "#ef4444", // Red - needs improvement
  },
} satisfies ChartConfig;

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  pieChartData,
  barChartData,
}) => {
  // Function to get performance category and color based on score
  const getPerformanceLevel = (value: number | string) => {
    if (typeof value === "number") {
      if (value >= 85)
        return {
          category: "excellent",
          label: "Excellent",
          color: "#10b981",
        };
      if (value >= 70)
        return { category: "good", label: "Good", color: "#22c55e" };
      if (value >= 55)
        return {
          category: "average",
          label: "Average",
          color: "#f59e0b",
        };
      return { category: "poor", label: "Poor", color: "#ef4444" };
    }
    // For string categories
    const category = value.toLowerCase();
    if (category.includes("excellent") || category.includes("85"))
      return {
        category: "excellent",
        label: "Excellent",
        color: "#10b981",
      };
    if (category.includes("good") || category.includes("70"))
      return { category: "good", label: "Good", color: "#22c55e" };
    if (category.includes("average") || category.includes("55"))
      return {
        category: "average",
        label: "Average",
        color: "#f59e0b",
      };
    return { category: "poor", label: "Poor", color: "#ef4444" };
  };

  // Process pie chart data with consistent colors
  const processedPieData = pieChartData.map((item) => {
    const performance = getPerformanceLevel(item.category);
    return {
      category: item.category,
      count: item.count,
      fill: performance.color,
      performanceLabel: performance.label,
    };
  });

  const totalCount = pieChartData.reduce((sum, item) => sum + item.count, 0);

  // Calculate average performance for insights
  const calculateOverallPerformance = () => {
    if (barChartData.length === 0) return null;
    const average =
      barChartData.reduce((sum, item) => sum + item.score, 0) /
      barChartData.length;
    const trend =
      barChartData.length > 1
        ? barChartData[barChartData.length - 1].score - barChartData[0].score
        : 0;

    return { average: Number(average.toFixed(1)), trend };
  };

  const overallPerformance = calculateOverallPerformance();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* Performance Distribution Pie Chart */}
      <div className="flex flex-col">
        <div className="items-center pb-4">
          <h3 className="text-lg font-semibold text-center text-foreground mb-1">
            Performance Distribution
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Overall grade breakdown
          </p>
        </div>
        <div className="flex-1">
          <ChartContainer
            config={performanceChartConfig}
            className="mx-auto aspect-square max-h-[280px] px-0"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="count"
                    hideLabel
                    formatter={(value, name, props) => [
                      `${value} reviews (${(
                        (Number(value) / totalCount) *
                        100
                      ).toFixed(1)}%)`,
                      props.payload.performanceLabel,
                    ]}
                  />
                }
              />
              <Pie
                data={processedPieData}
                dataKey="count"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const percentage = (percent * 100).toFixed(1);

                  const RADIAN = Math.PI / 180;
                  const radius =
                    innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  // Only show label if percentage is significant enough
                  if (percent < 0.05) return null;

                  return (
                    <g>
                      {/* Background pill shape for better readability */}
                      <rect
                        x={x - 28}
                        y={y - 12}
                        width={56}
                        height={24}
                        rx={6}
                        ry={6}
                        fill="rgba(0, 0, 0, 0.75)"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth={1}
                      />
                      {/* Percentage text */}
                      <text
                        x={x}
                        y={y + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize={13}
                        fontWeight="600"
                        style={{
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          letterSpacing: "0.025em",
                        }}
                      >
                        {`${percentage}%`}
                      </text>
                    </g>
                  );
                }}
                nameKey="category"
                stroke="hsl(var(--background))"
                strokeWidth={3}
              />
            </PieChart>
          </ChartContainer>
        </div>
        <div className="flex flex-col gap-2 text-sm mt-4">
          <div className="flex items-center gap-2 leading-none font-medium justify-center">
            Total Reviews: {totalCount}
          </div>
          <div className="text-muted-foreground leading-none text-center">
            Performance grade distribution across all evaluations
          </div>
        </div>
      </div>

      {/* Review Performance Timeline Bar Chart */}
      <div className="flex flex-col">
        <div className="items-center pb-4">
          <h3 className="text-lg font-semibold text-center text-foreground mb-1">
            Review Performance Timeline
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Individual review scores
          </p>
        </div>
        <div className="flex-1">
          <ChartContainer
            config={performanceChartConfig}
            className="min-h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={true}
                  vertical={false}
                  opacity={0.4}
                />
                <XAxis
                  dataKey="reviewName"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) =>
                    value.slice(0, 8) + (value.length > 8 ? "..." : "")
                  }
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={
                    barChartData.length > 0
                      ? {
                          fill: "hsl(var(--muted) / 0.1)",
                          stroke: "hsl(var(--border))",
                          strokeWidth: 1,
                          radius: 4,
                        }
                      : false
                  }
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name, props) => {
                        const score = value as number;
                        const performance = getPerformanceLevel(score);
                        return [
                          <span
                            key="score"
                            style={{
                              color: performance.color,
                              fontWeight: "600",
                            }}
                          >
                            {`${score.toFixed(1)}% (${performance.label})`}
                          </span>,
                          props.payload.reviewName,
                        ];
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="score"
                  radius={[6, 6, 0, 0]}
                  stroke="hsl(var(--background))"
                  strokeWidth={1}
                >
                  {barChartData.map((entry, index) => {
                    const performance = getPerformanceLevel(entry.score);
                    return (
                      <Cell key={`cell-${index}`} fill={performance.color} />
                    );
                  })}
                  <LabelList
                    dataKey="score"
                    position="top"
                    offset={8}
                    content={(props) => {
                      const { x, y, value, index, width } = props;
                      if (typeof index === "number" && barChartData[index]) {
                        const performance = getPerformanceLevel(
                          barChartData[index].score,
                        );
                        return (
                          <text
                            x={Number(x) + Number(width) / 2}
                            y={Number(y) - 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={performance.color}
                            fontSize="11px"
                            fontWeight="600"
                          >
                            {`${Number(value).toFixed(1)}%`}
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm mt-4">
          {overallPerformance && (
            <>
              <div className="flex items-center gap-2 leading-none font-medium">
                Average Score: {overallPerformance.average.toFixed(1)}% (
                {getPerformanceLevel(overallPerformance.average).label})
              </div>
              <div className="text-muted-foreground leading-none">
                Showing performance trend across {barChartData.length} reviews
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
