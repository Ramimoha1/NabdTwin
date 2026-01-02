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
