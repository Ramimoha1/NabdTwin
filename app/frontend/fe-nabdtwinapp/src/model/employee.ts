export interface EmployeeDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    department: string;
    team: string;
    branchId: string;
    floorId: string;
    joinDate: string;
    supervisorName?: string;
    skills: string[];
    kpis: {
        tasksCompleted: number;
        tasksTotal: number;
        attendanceRate: number;
        performanceScore: number;
        productivityScore: number;
    };
    recentReports: Array<{
        id: string;
        title: string;
        date: string;
        type: string;
    }>;
}