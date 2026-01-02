import type { Employee } from './branch';

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
