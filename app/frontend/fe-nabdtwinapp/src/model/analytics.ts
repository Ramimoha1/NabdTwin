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


export interface BranchAnalytics {
    id: string;
    branchId: string;
    date: string;
    revenue: number;
    revenueTarget: number;
    productivityScore: number;
    satisfactionScore: number;
    growthRate: number;
    performanceRating: 'excellent' | 'good' | 'average' | 'poor';
    employeeCount: number;
    joinedCount: number;
    leftCount: number;
}

export interface FloorAnalytics {
    id: string;
    floorId: string;
    date: string;
    occupancyRate: number;
    productivityScore: number;
}

export interface EmployeeAnalytics {
    id: string;
    employeeId: string;
    date: string;
    tasksCompleted: number;
    tasksTotal: number;
    attendanceRate: number;
    performanceScore: number;
    productivityScore: number;
    projectsCompleted: number;
}

export interface HistoryDataPoint {
    date: string;
    [key: string]: any;
}
