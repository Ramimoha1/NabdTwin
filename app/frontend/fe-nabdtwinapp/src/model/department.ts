export interface DepartmentData {
    id: string;
    name: string;
    headName: string;
    branchId?: string;    //just added temporarily for mock data
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


