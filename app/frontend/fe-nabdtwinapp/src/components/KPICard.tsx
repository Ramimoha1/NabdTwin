import { Info, TrendingUp, TrendingDown } from 'lucide-react';

export function KPICard({ title, value, target, unit = '', trend, trendValue, explanation, color }: any) {
    const isPositive = trend === 'up';

    // Map backend color classes to actual hex colors
    const colorMap: Record<string, string> = {
        'bg-blue-600': '#2563eb',
        'bg-green-600': '#16a34a',
        'bg-red-600': '#dc2626',
        'bg-amber-600': '#d97706',
        'bg-emerald-600': '#059669',
        'bg-slate-600': '#475569'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm text-slate-600">{title}</h3>
                <div className="group relative">
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs p-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                        {explanation}
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-slate-900">{value}</span>
                        <span className="text-lg text-slate-500">{unit}</span>
                    </div>
                    {target && <div className="text-xs text-slate-500 mt-1">Target: {target}{unit}</div>}
                </div>

                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm">{trendValue}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${target ? Math.min((Number(value) / target) * 100, 100) : 100}%`,
                            backgroundColor: colorMap[color] || '#2563eb'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}