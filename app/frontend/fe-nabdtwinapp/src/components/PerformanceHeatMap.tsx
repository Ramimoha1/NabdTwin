import { Card } from '../externaluicomponents/Card.tsx';
import type {Branch} from "../Types";

interface PerformanceHeatmapProps {
    branches: Branch[];
}

export function PerformanceHeatmap({ branches }: PerformanceHeatmapProps) {
    const metrics = [
        { key: 'productivity', label: 'Productivity' },
        { key: 'satisfaction', label: 'Satisfaction' },
        { key: 'growth', label: 'Growth' }
    ];

    const getHeatmapColor = (value: number, metric: string) => {
        if (metric === 'growth') {
            if (value >= 10) return 'bg-green-500';
            if (value >= 5) return 'bg-yellow-500';
            return 'bg-red-500';
        } else {
            if (value >= 85) return 'bg-green-500';
            if (value >= 75) return 'bg-yellow-500';
            return 'bg-red-500';
        }
    };

    const getOpacity = (value: number, metric: string) => {
        if (metric === 'growth') {
            const normalized = Math.min(value / 20, 1);
            return Math.max(normalized, 0.3);
        } else {
            const normalized = value / 100;
            return Math.max(normalized, 0.3);
        }
    };

    return (
        <Card className="p-4">
            <h3 className="mb-4">Performance Heatmap</h3>
            <div className="space-y-2">
                {metrics.map((metric) => (
                    <div key={metric.key} className="space-y-1">
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <div className="flex gap-1">
                            {branches.map((branch) => {
                                const value = branch.kpis[metric.key as keyof typeof branch.kpis] as number;
                                const color = getHeatmapColor(value, metric.key);
                                const opacity = getOpacity(value, metric.key);

                                return (
                                    <div
                                        key={branch.id}
                                        className={`flex-1 h-8 rounded ${color} flex items-center justify-center text-xs text-white relative group cursor-pointer`}
                                        style={{ opacity }}
                                        title={`${branch.name}: ${value}${metric.key === 'growth' ? '%' : '%'}`}
                                    >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {value}
                        {metric.key === 'growth' ? '%' : '%'}
                    </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>High</span>
            </div>
        </Card>
    );
}
