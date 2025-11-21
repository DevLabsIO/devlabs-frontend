"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

interface DotProps {
    cx?: number;
    cy?: number;
    index?: number;
}

export interface ReviewPerformance {
    reviewId: string;
    reviewName: string;
    startDate: string;
    endDate: string;
    status: "completed" | "missed" | "ongoing" | "upcoming";
    showResult: boolean;
    score: number | null;
    totalScore: number | null;
    scorePercentage: number | null;
    courseName: string;
    courseCode: string;
}

export interface CoursePerformanceData {
    courseId: string;
    courseName: string;
    courseCode: string;
    color: string;
    reviews: ReviewPerformance[];
}

interface PerformanceOverviewChartProps {
    performanceData: CoursePerformanceData[];
}

const processChartData = (performanceData: CoursePerformanceData[]) => {
    const allReviews = new Map<
        string,
        {
            reviewName: string;
            startDate: string;
            scores: { [courseId: string]: number | null };
            isGhost?: boolean;
        }
    >();

    performanceData.forEach((course) => {
        course.reviews.forEach((review) => {
            if (review.status === "completed" && review.scorePercentage !== null) {
                if (!allReviews.has(review.reviewName)) {
                    allReviews.set(review.reviewName, {
                        reviewName: review.reviewName,
                        startDate: review.startDate,
                        scores: {},
                        isGhost: false,
                    });
                }
                const reviewData = allReviews.get(review.reviewName);
                if (reviewData) {
                    reviewData.scores[course.courseId] = review.scorePercentage;
                }
            }
        });
    });

    const chartDataWithScores = Array.from(allReviews.values());
    chartDataWithScores.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const allCourseIds = performanceData.map((c) => c.courseId);
    chartDataWithScores.forEach((d) => {
        allCourseIds.forEach((id) => {
            if (!(id in d.scores)) {
                d.scores[id] = null;
            }
        });
    });

    if (chartDataWithScores.length === 1) {
        const singlePoint = chartDataWithScores[0];
        const enhancedData = [];

        allCourseIds.forEach((courseId) => {
            const score = singlePoint.scores[courseId];
            if (score !== null) {
                const startFromZero = score >= 50;
                const startValue = startFromZero ? 0 : 100;

                enhancedData.push({
                    reviewName: "",
                    isGhost: true,
                    [courseId]: startValue,
                });

                const steps = 3;
                for (let i = 1; i <= steps; i++) {
                    const t = i / (steps + 2);
                    const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

                    const interpolatedScore = startValue + (score - startValue) * easeT;

                    enhancedData.push({
                        reviewName: "",
                        isGhost: true,
                        [courseId]: interpolatedScore,
                    });
                }
            }
        });

        enhancedData.push({
            reviewName: singlePoint.reviewName,
            isGhost: false,
            ...singlePoint.scores,
        });

        allCourseIds.forEach((courseId) => {
            const score = singlePoint.scores[courseId];
            if (score !== null) {
                const steps = 2;
                for (let i = 1; i <= steps; i++) {
                    const t = i / (steps + 1);
                    const flattenT = 1 - Math.pow(1 - t, 3);
                    const targetScore = score; // Flatten to current score
                    const interpolatedScore = score + (targetScore - score) * flattenT;

                    enhancedData.push({
                        reviewName: "",
                        isGhost: true,
                        [courseId]: interpolatedScore,
                    });
                }
            }
        });

        return enhancedData;
    }

    return chartDataWithScores.map((d) => ({
        reviewName: d.reviewName,
        isGhost: d.isGhost || false,
        ...d.scores,
    }));
};

const CustomTooltip = ({
    active,
    payload,
    label,
    config,
}: TooltipProps<number, string> & { config: ChartConfig }) => {
    if (active && payload && payload.length) {
        return (
            <div className="overflow-hidden rounded-lg border border-border bg-background p-2 shadow-xl">
                <p className="mb-1 font-semibold">{label}</p>
                <div className="space-y-1">
                    {payload
                        .filter((p) => p.value !== null && p.dataKey)
                        .map((p) => {
                            const itemConfig = config[p.dataKey!];
                            if (!itemConfig) return null;
                            return (
                                <div
                                    key={p.dataKey}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: itemConfig.color as string }}
                                        />
                                        <span className="truncate">{itemConfig.label}</span>
                                    </div>
                                    <span className="font-mono font-semibold">
                                        {p.value!.toFixed(2)}%
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    }
    return null;
};

export const PerformanceOverviewChart = ({ performanceData }: PerformanceOverviewChartProps) => {
    const [selectedCourseIds, setSelectedCourseIds] = React.useState<string[]>(() =>
        performanceData.map((c) => c.courseId)
    );

    React.useEffect(() => {
        setSelectedCourseIds(performanceData.map((c) => c.courseId));
    }, [performanceData]);

    const chartData = React.useMemo(() => processChartData(performanceData), [performanceData]);

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {};
        performanceData.forEach((course) => {
            config[course.courseId] = {
                label: course.courseName,
                color: course.color,
            };
        });
        return config;
    }, [performanceData]);

    const filteredPerformanceData = React.useMemo(() => {
        return performanceData.filter((course) => selectedCourseIds.includes(course.courseId));
    }, [selectedCourseIds, performanceData]);

    const toggleCourseId = (courseId: string) => {
        setSelectedCourseIds((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
    };

    const toggleAll = () => {
        if (selectedCourseIds.length === performanceData.length) {
            setSelectedCourseIds([]);
        } else {
            setSelectedCourseIds(performanceData.map((c) => c.courseId));
        }
    };

    if (performanceData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Your review scores across all courses</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-10">
                    <p>No performance data available to display.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Your review scores across all courses</CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[200px] justify-between">
                            Select Courses
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-1">
                        <div
                            className="px-2 py-1.5 text-sm font-semibold rounded-sm cursor-pointer hover:bg-muted"
                            onClick={toggleAll}
                        >
                            {selectedCourseIds.length === performanceData.length
                                ? "Deselect All"
                                : "Select All"}
                        </div>
                        <div className="my-1 h-px bg-muted" />
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {performanceData.map((course) => (
                                <div
                                    key={course.courseId}
                                    className="flex items-center justify-between space-x-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-muted"
                                    onClick={() => toggleCourseId(course.courseId)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: course.color }}
                                        />
                                        <span className="text-sm w-full truncate">
                                            {course.courseName}
                                        </span>
                                    </div>
                                    {selectedCourseIds.includes(course.courseId) && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="reviewName"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={(props) => {
                                if (chartData[props.index]?.isGhost) {
                                    return <g />;
                                }
                                return (
                                    <text
                                        x={props.x}
                                        y={props.y}
                                        textAnchor="middle"
                                        fill="currentColor"
                                        className="text-xs"
                                        dy={8}
                                    >
                                        {props.payload.value}
                                    </text>
                                );
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<CustomTooltip config={chartConfig} />}
                        />
                        {filteredPerformanceData.map((course) => (
                            <Line
                                key={course.courseId}
                                dataKey={course.courseId}
                                type="natural"
                                stroke={chartConfig[course.courseId]?.color as string}
                                strokeWidth={2.5}
                                dot={(props: DotProps) => {
                                    if (
                                        props.index !== undefined &&
                                        chartData[props.index]?.isGhost
                                    ) {
                                        return <g key={`${course.courseId}-dot-${props.index}`} />;
                                    }
                                    return (
                                        <circle
                                            key={`${course.courseId}-dot-${props.index}`}
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={5}
                                            fill={chartConfig[course.courseId]?.color as string}
                                            stroke="white"
                                            strokeWidth={2}
                                        />
                                    );
                                }}
                                activeDot={(props: DotProps) => {
                                    if (
                                        props.index !== undefined &&
                                        chartData[props.index]?.isGhost
                                    ) {
                                        return (
                                            <g key={`${course.courseId}-active-${props.index}`} />
                                        );
                                    }
                                    return (
                                        <circle
                                            key={`${course.courseId}-active-${props.index}`}
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={7}
                                            fill={chartConfig[course.courseId]?.color as string}
                                            stroke="white"
                                            strokeWidth={2}
                                        />
                                    );
                                }}
                                connectNulls={false}
                                animationDuration={800}
                                animationEasing="ease-in-out"
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
