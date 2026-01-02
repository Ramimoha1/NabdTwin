
function getStatusColor(status: string) {
    switch (status) {
        case 'success': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' };
        case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-600' };
        case 'info': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' };
        default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'text-slate-600' };
    }
};

export function TaskMetrics({ metrics }: { metrics: any[] }) {
    return (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg text-slate-900 mb-4">Task Metrics Overview</h3>
            <div className="space-y-3">
                {metrics.map((metric) => {
                    const colors = getStatusColor(metric.status);
                    const Icon = metric.icon;
                    return (
                        <div key={metric.label} className={`flex items-center justify-between p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
                            <div className="flex items-center gap-4">
                                <Icon className={`w-5 h-5 ${colors.icon}`} />
                                <div className="text-sm text-slate-900">{metric.label}</div>
                            </div>
                            <div className="text-2xl text-slate-900">{metric.value}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}