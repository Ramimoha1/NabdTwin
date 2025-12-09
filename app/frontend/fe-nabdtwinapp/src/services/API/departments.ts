import type { DepartmentData } from '../../model';

const mockDepartments: DepartmentData[] = [
    {
        id: 'dept-1',
        name: 'Engineering',
        headName: 'Dr. Evelyn Reed',
        employeeCount: 25,
        teamCount: 4,
        kpis: {
            efficiency: 92,
            satisfaction: 88,
            revenue: 500000,
            revenueTarget: 450000,
            tasksCompleted: 120,
            tasksTotal: 130,
        },
    },
    {
        id: 'dept-2',
        name: 'Marketing',
        headName: 'Leo Carter',
        employeeCount: 15,
        teamCount: 2,
        kpis: {
            efficiency: 85,
            satisfaction: 91,
            revenue: 750000,
            revenueTarget: 700000,
            tasksCompleted: 80,
            tasksTotal: 90,
        },
    },
];

export async function getDepartments(filters?: { branchId?: string }): Promise<DepartmentData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (filters?.branchId) {
        // In a real app, you'd filter by branch
    }
    return mockDepartments;
}

export async function getDepartment(id: string): Promise<DepartmentData | undefined> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDepartments.find(dept => dept.id === id);
}
