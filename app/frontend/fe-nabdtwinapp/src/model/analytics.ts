// Analytics-specific types
export interface AnalyticsDataPoint {
    date: string;
    value: number;
    label?: string;
}

export interface TrendData {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: 'up' | 'down' | 'stable';
}

export interface KPISummary {
    title: string;
    value: number;
    target?: number;
    unit?: string;
    trend?: TrendData;
    status?: 'excellent' | 'good' | 'average' | 'poor';
}

export interface DashboardStats {
    totalBranches: number;
    totalEmployees: number;
    totalFloors: number;
    avgProductivity: number;
    avgSatisfaction: number;
    totalRevenue: number;
    revenueGrowth: number;
}
