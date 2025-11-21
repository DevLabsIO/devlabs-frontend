import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceMetric {
    label: string;
    value: number;
    color: string;
}

interface PerformanceChartProps {
    metrics: PerformanceMetric[];
}

export default function PerformanceChart({ metrics }: PerformanceChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {metrics.map((metric, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{metric.label}</span>
                                <span className="text-sm text-muted-foreground">
                                    {metric.value}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${metric.color} h-2 rounded-full`}
                                    style={{ width: `${metric.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
