import { useState } from "react";
import MainPageHeader from "../components/MainPageHeader.tsx";
import { useInsightsData } from "../hooks/useInsightsData";
import { KPICard } from "../components/KPICard";
import { EmployeeDetailsModal } from "../components/EmployeeDetailsModal";
import { TrendChart } from "../components/TrendChart";
import { BranchComparisonChart } from "../components/BranchComparisonChart";
import { TopEmployees } from "../components/TopEmployees";
import { TaskMetrics } from "../components/TaskMetrics";
import { EmployeeChanges } from "../components/EmployeeChanges";

export default function InsightsPage() {
    const [selectedKPI, setSelectedKPI] = useState('productivity');
    const [dateRange, setDateRange] = useState('last30days');
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

    const {
        kpis,
        trendData,
        employeeChanges,
        taskMetrics,
        branches,
        topEmployees,
        isLoading,
    } = useInsightsData();

    const kpiConfig: Record<string, any> = {
        productivity: { label: 'Productivity', color: '#2563eb' },
        delivery: { label: 'On-time Delivery', color: '#16a34a' },
        lateTasks: { label: 'Late Tasks', color: '#dc2626' }
    };

    const title = "Insights";
    const description = "Here are your insights";

    if (isLoading) return (
        <div>
            <MainPageHeader title={title} description={description} />
            <div style={{ padding: 20 }}>Loading insights data...</div>
        </div>
    );

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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
            </div>

            {/* Trend Chart */}
            <TrendChart data={trendData} selectedKPI={selectedKPI} kpiConfig={kpiConfig} />

            {/* Employee Changes & Task Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <EmployeeChanges changes={employeeChanges} />
                <TaskMetrics metrics={taskMetrics} />
            </div>

            {/* Branch Overview */}
            <BranchComparisonChart data={branches} />

            {/* Top Employees */}
            <TopEmployees employees={topEmployees} onSelectEmployee={setSelectedEmployee} />

            {selectedEmployee && (
                <EmployeeDetailsModal
                    employee={topEmployees.find(emp => emp.id === parseInt(selectedEmployee))}
                    onClose={() => setSelectedEmployee(null)}
                />
            )}
        </div>
    );
}