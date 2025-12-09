import { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import MainPageHeader from "../components/MainPageHeader.tsx";
import { Menu, Bell, Search, User, Settings, TrendingUp, TrendingDown, Info, CheckCircle, Clock, XCircle, Loader, Building2, Calendar, Users, Award, X, UserPlus, UserMinus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Type definitions
type Kpi = {
    title?: string;
    value: number;
    target?: number;
    unit?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    explanation?: string;
    color?: string;
    code?: string;
    label?: string;
    name?: string;
    [key: string]: any;
};

// Mock Data
const MOCK_KPIS = [
    { title: 'Productivity', value: 87, target: 90, unit: '%', trend: 'up' as const, trendValue: '+5.2%', explanation: 'Calculated as (Completed Tasks / Total Assigned Tasks) × 100. Measures the efficiency of task completion across all branches.', color: 'bg-blue-600' },
    { title: 'On-time Delivery', value: 92, target: 95, unit: '%', trend: 'up' as const, trendValue: '+3.1%', explanation: 'Percentage of tasks completed before or on the due date. Critical indicator of operational reliability and customer satisfaction.', color: 'bg-green-600' },
    { title: 'Quality Score', value: 89, target: 85, unit: '%', trend: 'up' as const, trendValue: '+2.8%', explanation: 'Average quality rating based on task reviews and approval rates. Higher scores indicate better work output quality.', color: 'bg-purple-600' },
    { title: 'Late Tasks', value: 24, unit: '', trend: 'down' as const, trendValue: '-12%', explanation: 'Number of tasks that exceeded their deadline. Lower values indicate better time management and resource allocation.', color: 'bg-red-600' },
    { title: 'Tasks In Progress', value: 156, unit: '', trend: 'up' as const, trendValue: '+8%', explanation: 'Current active tasks across all branches. Indicates workload distribution and operational capacity utilization.', color: 'bg-amber-600' },
    { title: 'Employees Joined', value: 12, unit: '', trend: 'up' as const, trendValue: '+4', explanation: 'New employees onboarded during the selected period. Reflects organizational growth and hiring activity.', color: 'bg-emerald-600' },
    { title: 'Employees Resigned', value: 3, unit: '', trend: 'down' as const, trendValue: '-2', explanation: 'Employees who left during the selected period. Lower attrition rates indicate better employee satisfaction and retention.', color: 'bg-slate-600' }
];

const MOCK_BRANCHES = [
    { name: 'HQ', score: 88, tasks: 245, employees: 42, color: '#3b82f6' },
    { name: 'East', score: 85, tasks: 198, employees: 35, color: '#8b5cf6' },
    { name: 'West', score: 91, tasks: 223, employees: 38, color: '#10b981' },
    { name: 'North', score: 82, tasks: 176, employees: 29, color: '#f59e0b' },
    { name: 'South', score: 87, tasks: 201, employees: 33, color: '#ec4899' }
];

const MOCK_EMPLOYEES = [
    { id: 1, name: 'Sara Ahmed', branch: 'HQ', score: 95, tasks: 48, avatar: 'SA' },
    { id: 2, name: 'Omar Khalil', branch: 'West', score: 92, tasks: 45, avatar: 'OK' },
    { id: 3, name: 'Laila Hassan', branch: 'East', score: 91, tasks: 42, avatar: 'LH' },
    { id: 4, name: 'Noor Ibrahim', branch: 'HQ', score: 89, tasks: 44, avatar: 'NI' },
    { id: 5, name: 'Hassan Mohamed', branch: 'South', score: 88, tasks: 41, avatar: 'HM' },
    { id: 6, name: 'Fatima Ali', branch: 'West', score: 87, tasks: 43, avatar: 'FA' },
    { id: 7, name: 'Kareem Yousef', branch: 'North', score: 86, tasks: 39, avatar: 'KY' },
    { id: 8, name: 'Maha Salem', branch: 'East', score: 85, tasks: 40, avatar: 'MS' }
];

const TASK_METRICS = [
    { label: 'Total Tasks', value: 867, change: '+12%', trend: 'up' as const, status: 'neutral' as const, icon: Clock },
    { label: 'Completed Tasks', value: 743, change: '+8%', trend: 'up' as const, status: 'success' as const, icon: CheckCircle },
    { label: 'Delayed Tasks', value: 24, change: '-15%', trend: 'down' as const, status: 'warning' as const, icon: Clock },
    { label: 'Tasks In Progress', value: 156, change: '+5%', trend: 'up' as const, status: 'info' as const, icon: Loader },
    { label: 'On-time Delivery Rate', value: '92%', change: '+3%', trend: 'up' as const, status: 'success' as const, icon: CheckCircle }
];

const EMPLOYEE_CHANGES = {
    joined: { count: 12, change: '+4', trend: 'up' as const, details: [{ branch: 'HQ', count: 4 }, { branch: 'West', count: 3 }, { branch: 'East', count: 3 }, { branch: 'South', count: 2 }] },
    resigned: { count: 3, change: '-2', trend: 'down' as const, details: [{ branch: 'North', count: 2 }, { branch: 'East', count: 1 }] }
};

// Components
function KPICard({ title, value, target, unit = '', trend, trendValue, explanation, color }: any) {
    const isPositive = trend === 'up';

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
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${target ? Math.min((Number(value) / target) * 100, 100) : 75}%` }} />
                </div>
            </div>
        </div>
    );
}

export default function InsightsPage() {
    const [selectedBranch, setSelectedBranch] = useState('HQ');
    const [selectedKPI, setSelectedKPI] = useState('productivity');
    const [dateRange, setDateRange] = useState('last30days');
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

    const generateTrendData = () => {
        const days = dateRange === 'last7days' ? 7 : dateRange === 'last30days' ? 30 : 90;
        const data = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - i));
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                productivity: 75 + Math.random() * 20,
                delivery: 80 + Math.random() * 15,
                quality: 82 + Math.random() * 12,
                lateTasks: 30 - Math.random() * 10
            });
        }
        return data;
    };

    const trendData = generateTrendData();
    const kpiConfig: Record<string, any> = {
        productivity: { label: 'Productivity', color: '#2563eb' },
        delivery: { label: 'On-time Delivery', color: '#16a34a' },
        quality: { label: 'Quality', color: '#9333ea' },
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

    const [kpis, setKpis] = useState<Kpi[]>([]);
    const [err, setErr] = useState("");

    useEffect(() => {
        const API = import.meta.env.VITE_API_BASE || "http://localhost:3001";
        const token = localStorage.getItem("jwt") ||
            localStorage.getItem("token") ||
            (() => {
                try {
                    const root = JSON.parse(localStorage.getItem("persist:root") || "{}");
                    return (root.token || "").replace(/^"+|"+$/g, "");
                } catch {
                    return "";
                }
            })();

        fetch(`${API}/api/insights`, {
            headers: token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
            credentials: "include"
        })
            .then(r => r.ok ? r.json() : Promise.reject(new Error(`API ${r.status}`)))
            .then(d => {
                const extracted = Array.isArray(d) ? d : (d.data ?? d.kpis ?? []);
                setKpis(extracted.length > 0 ? extracted : MOCK_KPIS);
            })
            .catch(() => setKpis(MOCK_KPIS));
    }, []);

    const title = "Insights";
    const description = "Here are your insights";

    if (err) return (
        <div>
            <MainPageHeader title={title} description={description} />
            <div style={{ padding: 20, color: "crimson" }}>Error: {err}</div>
        </div>
    );
    if (!kpis.length) return (
        <div>
            <MainPageHeader title={title} description={description} />
            <div style={{ padding: 20 }}>Loading…</div>
        </div>
    );

    const EmployeeDetailsModal = () => {
        if (!selectedEmployee) return null;

        const employee = MOCK_EMPLOYEES.find(emp => emp.id === parseInt(selectedEmployee));
        if (!employee) return null;

        const generateEmployeeData = () => {
            const days = 30;
            const data = [];
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (days - i));
                data.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    completion: 75 + Math.random() * 20,
                    utilization: 60 + Math.random() * 30,
                    lateTasks: Math.floor(Math.random() * 5),
                    inProgress: Math.floor(3 + Math.random() * 8)
                });
            }
            return data;
        };

        const employeeData = generateEmployeeData();

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
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="text-sm text-blue-600">Total Tasks</div>
                                <div className="text-2xl text-blue-900 mt-1">{employee.tasks}</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="text-sm text-green-600">Completion Rate</div>
                                <div className="text-2xl text-green-900 mt-1">96%</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="text-sm text-purple-600">Quality Score</div>
                                <div className="text-2xl text-purple-900 mt-1">92%</div>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <div className="text-sm text-amber-600">Avg. Response</div>
                                <div className="text-2xl text-amber-900 mt-1">2.3h</div>
                            </div>
                        </div>

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
                                        <LineChart data={employeeData}>
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
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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
                        <option value="quality">Quality</option>
                        <option value="lateTasks">Late Tasks</option>
                    </select>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Export Report</button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_KPIS.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
            </div>

            {/* Trend Chart */}
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

            {/* Employee Changes & Task Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee Changes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg text-slate-900 mb-4">Employee Changes</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <UserPlus className="w-5 h-5 text-emerald-600" />
                                <div className="text-2xl text-slate-900">{EMPLOYEE_CHANGES.joined.count}</div>
                                <span className="text-sm text-emerald-700">Joined</span>
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <UserMinus className="w-5 h-5 text-slate-600" />
                                <div className="text-2xl text-slate-900">{EMPLOYEE_CHANGES.resigned.count}</div>
                                <span className="text-sm text-slate-700">Resigned</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task Metrics */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg text-slate-900 mb-4">Task Metrics Overview</h3>
                    <div className="space-y-3">
                        {TASK_METRICS.map((metric) => {
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

            {/* Branch Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Branch Performance Comparison
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={MOCK_BRANCHES}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} onClick={(data: any) => data?.name && setSelectedBranch(data.name)} cursor="pointer">
                            {MOCK_BRANCHES.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Employees */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Top Performing Employees
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MOCK_EMPLOYEES.slice(0, 8).map((employee, index) => (
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