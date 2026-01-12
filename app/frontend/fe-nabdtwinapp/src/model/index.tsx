export interface Branch {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    kpis: {
        revenue: number;
        employees: number;
        satisfaction: number;
        productivity: number;
        growth: number;
    };
    branchKpis?: BranchKPI[]; 
    financials?: BranchFinancial[];
    alerts?: Alert[];
    
    floors: Floor[];
    performance: 'excellent' | 'good' | 'average' | 'poor';
    totalFloors?: number;
    totalEmployees?: number;
    branchStatus?: 'active' | 'inactive' | 'maintenance';
}

export interface BranchKPI {
    id: string;
    date?: string;
    productivityScore?: number;
    satisfactionScore?: number;
    revenue?: number;
    revenueTarget?: number;
}

export interface BranchFinancial {
    id: string;
    date?: string;
    revenue: number;
    expenses: number;
    profitMargin: number;
}

export interface Floor {
    id: string;
    branchId: string;
    name: string;
    number: number;
    workspaces: Workspace[];
    kpis: {
        occupancy: number;
        productivity: number;
        satisfaction: number;
    };
}

export interface Workspace {
    id: string;
    floorId: string;
    name: string;
    type: 'office' | 'meeting' | 'open-space' | 'lab';
    employees: Employee[];
    kpis: {
        utilization: number;
        productivity: number;
        collaboration: number;
    };
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    workspaceId: string;
    email: string;
    phone: string;
    performance: {
        score: number;
        attendance: number;
        projectsCompleted: number;
        tasksCompleted: number;
    };
    avatar?: string;
}

export interface EmployeeDetail extends Employee {
    joinDate: Date;
    supervisorName?: string;
    skills: string[];
    recentReports: { id: string; title: string; date: Date; type: string }[];
    kpis: {
        performanceScore: number;
        tasksCompleted: number;
        tasksTotal: number;
        attendanceRate: number;
        productivityScore: number;
    };
}

export interface TeamData {
    id: string;
    name: string;
    department: string;
    leaderName: string;
    memberCount: number;
    members: string[];
    kpis: {
        avgPerformance: number;
        productivity: number;
        tasksCompleted: number;
        tasksTotal: number;
    };
}

export interface DepartmentData {
    id: string;
    name: string;
    headName: string;
    employeeCount: number;
    teamCount: number;
    kpis: {
        efficiency: number;
        satisfaction: number;
        revenue: number;
        revenueTarget: number;
        tasksCompleted: number;
        tasksTotal: number;
    };
}

export interface Report {
    id: string;
    title: string;
    type: 'branch' | 'floor' | 'employee' | 'kpi';
    generatedAt: Date;
    generatedBy: string;
    data: any;
}

export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    timestamp: Date | string;
    branchId?: string; 
    read: boolean;
}

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
