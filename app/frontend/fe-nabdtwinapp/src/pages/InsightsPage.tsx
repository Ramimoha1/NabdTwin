import { useState } from "react";
import { createPortal } from 'react-dom';
import MainPageHeader from "../components/MainPageHeader.tsx";
import { TrendingUp, TrendingDown, Info, Building2, Users, Award, X, UserPlus, UserMinus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { 
    fetchInsightsKpis, 
    fetchTrends, 
    fetchEmployeeChanges, 
    fetchTaskMetrics, 
    fetchBranchComparison, 
    fetchTopEmployees,
    fetchEmployeePerformance
} from '../services/API/insightsService';

// Components
function KPICard({ title, value, target, unit = '', trend, trendValue, explanation, color }: any) {
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

export default function InsightsPage() {
    const [selectedKPI, setSelectedKPI] = useState('productivity');
    const [dateRange, setDateRange] = useState('last30days');
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

    const kpiConfig: Record<string, any> = {
        productivity: { label: 'Productivity', color: '#2563eb' },
        delivery: { label: 'On-time Delivery', color: '#16a34a' },
        lateTasks: { label: 'Late Tasks', color: '#dc2626' }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' };
            case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-600' };
            case 'info': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' };
            default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'text-slate-600' };
        }
    };

    // Fetch all analytics data using useQuery
    const { data: kpis = [], isLoading: isLoadingKpis } = useQuery({
        queryKey: ["insights-kpis"],
        queryFn: fetchInsightsKpis,
    });

    const { data: trendData = [], isLoading: isLoadingTrends } = useQuery({
        queryKey: ["insights-trends"],
        queryFn: fetchTrends,
    });

    const { data: employeeChanges = { joined: { count: 0, change: '+0', trend: 'up', details: [] }, resigned: { count: 0, change: '-0', trend: 'down', details: [] } }, isLoading: isLoadingEmpChanges } = useQuery({
        queryKey: ["insights-employee-changes"],
        queryFn: fetchEmployeeChanges,
    });

    const { data: taskMetrics = [], isLoading: isLoadingTaskMetrics } = useQuery({
        queryKey: ["insights-task-metrics"],
        queryFn: fetchTaskMetrics,
    });

    const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
        queryKey: ["insights-branches"],
        queryFn: fetchBranchComparison,
    });

    const { data: topEmployees = [], isLoading: isLoadingTopEmployees } = useQuery({
        queryKey: ["insights-top-employees"],
        queryFn: fetchTopEmployees,
    });

    const isLoadingData = isLoadingKpis || isLoadingTrends || isLoadingEmpChanges || 
                          isLoadingTaskMetrics || isLoadingBranches || isLoadingTopEmployees;

    const title = "Insights";
    const description = "Here are your insights";

    if (isLoadingData) return (
        <div>
            <MainPageHeader title={title} description={description} />
            <div style={{ padding: 20 }}>Loading insights data...</div>
        </div>
    );

    const EmployeeDetailsModal = () => {
        if (!selectedEmployee) return null;

        const employee = topEmployees.find(emp => emp.id === parseInt(selectedEmployee));
        if (!employee) return null;

        const { data: performanceData = [], isLoading: isLoadingPerformance } = useQuery({
            queryKey: ['employeePerformance', employee.id],
            queryFn: () => fetchEmployeePerformance(employee.id),
            enabled: !!employee.id
        });

        return createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                                {employee.avatar}
                            </div>
                            <div>
                                <h3 className="text-lg text-slate-900">{employee.name}</h3>
                                <p className="text-sm text-slate-500">{employee.branch} Branch • Score: {employee.score}%</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedEmployee(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="text-sm text-blue-600">Total Tasks</div>
                                <div className="text-2xl text-blue-900 mt-1">{employee.tasks}</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="text-sm text-green-600">Performance Score</div>
                                <div className="text-2xl text-green-900 mt-1">{employee.score}%</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="text-sm text-purple-600">Branch</div>
                                <div className="text-2xl text-purple-900 mt-1">{employee.branch}</div>
                            </div>
                        </div>

                        {isLoadingPerformance ? (
                            <div className="text-center py-8 text-slate-500">Loading performance data...</div>
                        ) : performanceData.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {[
                                    { title: 'Task Completion Trend', dataKey: 'completion', color: '#3b82f6' },
                                    { title: 'Utilization Rate', dataKey: 'utilization', color: '#10b981' },
                                    { title: 'Late Tasks', dataKey: 'lateTasks', color: '#ef4444' },
                                    { title: 'Tasks In Progress', dataKey: 'inProgress', color: '#f59e0b' }
                                ].map(chart => (
                                    <div key={chart.title} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="text-sm text-slate-900 mb-4">{chart.title}</h4>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <LineChart data={performanceData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '10px' }} interval={6} />
                                                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} width={35} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                                                <Line type="monotone" dataKey={chart.dataKey} stroke={chart.color} strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg p-6 text-center">
                                <p className="text-slate-600">No performance data available for this employee.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
            {/* Header */}
            <div>
                <h2 className="text-2xl text-slate-900">Organizational Performance Dashboard</h2>
                <p className="text-sm text-slate-500 mt-1">Monitor KPIs and drill down into branches and employees</p>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="last90days">Last 90 Days</option>
                    </select>
                    <select value={selectedKPI} onChange={(e) => setSelectedKPI(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                        <option value="productivity">Productivity</option>
                        <option value="delivery">On-time Delivery</option>
                        <option value="lateTasks">Late Tasks</option>
                    </select>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Export Report</button>
            </div>

            {/* KPI Cards - Connected to Real Backend Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
            </div>

            {/* Trend Chart - Connected to Backend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg text-slate-900 mb-4">Overall Trend Analysis</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey={selectedKPI} stroke={kpiConfig[selectedKPI].color} strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {/* Employee Changes & Task Metrics - Connected to Backend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee Changes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg text-slate-900 mb-4">Employee Changes</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <UserPlus className="w-5 h-5 text-emerald-600" />
                                <div className="text-2xl text-slate-900">{employeeChanges.joined.count}</div>
                                <span className="text-sm text-emerald-700">Joined</span>
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <UserMinus className="w-5 h-5 text-slate-600" />
                                <div className="text-2xl text-slate-900">{employeeChanges.resigned.count}</div>
                                <span className="text-sm text-slate-700">Resigned</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Task Metrics */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg text-slate-900 mb-4">Task Metrics Overview</h3>
                    <div className="space-y-3">
                        {taskMetrics.map((metric) => {
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
            </div>

            {/* Branch Overview - Connected to Backend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Branch Performance Comparison
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={branches}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: 'none', 
                                borderRadius: '8px', 
                                color: '#fff' 
                            }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} cursor="pointer">
                            {branches.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Employees - Connected to Backend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Top Performing Employees
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topEmployees.map((employee, index) => (
                        <button
                            key={employee.id}
                            onClick={() => setSelectedEmployee(employee.id.toString())}
                            className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm">{employee.avatar}</div>
                                    {index < 3 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"><Award className="w-3 h-3 text-white" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-slate-900 truncate">{employee.name}</div>
                                    <div className="text-xs text-slate-500">{employee.branch}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div>
                                    <div className="text-xs text-slate-500">Score</div>
                                    <div className="text-lg text-slate-900">{employee.score}%</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Tasks</div>
                                    <div className="text-lg text-slate-900">{employee.tasks}</div>
                                </div>
                                <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedEmployee && <EmployeeDetailsModal />}
        </div>
    );
}