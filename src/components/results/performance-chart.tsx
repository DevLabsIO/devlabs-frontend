"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { CourseData } from "@/types/entities";

interface PerformanceChartProps {
  data: CourseData[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-lg">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {new Date(label).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="space-y-2">
          {payload.map((entry, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.dataKey}</span>
              </div>
              <span className="text-sm font-bold text-primary">
                {typeof entry.value === "number"
                  ? entry.value.toFixed(1)
                  : "0.0"}
                %
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const courseColors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  const allDates = Array.from(
    new Set(
      data.flatMap((course) =>
        course.reviewHistory.map((review) => review.reviewDate),
      ),
    ),
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const chartData = allDates.map((date) => {
    const dataPoint: { date: string; [courseName: string]: number | string } = {
      date,
    };

    data.forEach((course) => {
      const review = course.reviewHistory.find((r) => r.reviewDate === date);
      if (review) {
        dataPoint[course.name] =
          (review.averageScore / review.maxPossibleScore) * 100;
      }
    });

    return dataPoint;
  });

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold">Performance Trends</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={true}
              tick={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={true}
              axisLine={true}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: "10px" }}
            />
            {data.map((course, index) => (
              <Line
                key={course.id}
                type="monotone"
                dataKey={course.name}
                stroke={courseColors[index % courseColors.length]}
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: courseColors[index % courseColors.length],
                  fill: courseColors[index % courseColors.length],
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                  stroke: courseColors[index % courseColors.length],
                  fill: courseColors[index % courseColors.length],
                }}
                animationDuration={1500}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
