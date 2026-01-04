import type { DepartmentData, EmployeeDetail, TeamData } from "../../model";
import { api } from "./api";

// ... [Interfaces remain the same] ...



const mockEmployees: EmployeeDetail[] = [
    {
        id: 'emp-1',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'ahmed.hassan@company.com',
        phone: '+966 50 123 4567',
        role: 'Senior Developer',
        department: 'Engineering',
        team: 'Backend Team',
        branchId: '1', // CHANGED from 'branch-1' to '1'
        floorId: 'floor-1',
        joinDate: '2023-01-15',
        supervisorName: 'Sara Mohamed',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        kpis: {
            tasksCompleted: 45,
            tasksTotal: 50,
            attendanceRate: 96,
            performanceScore: 92,
            productivityScore: 88
        },
        recentReports: [
            { id: 'rep-1', title: 'Q4 Performance Review', date: '2024-12-01', type: 'Performance' },
            { id: 'rep-2', title: 'Project Completion Report', date: '2024-11-15', type: 'Project' }
        ]
    },
    {
        id: 'emp-2',
        firstName: 'Fatima',
        lastName: 'Ali',
        email: 'fatima.ali@company.com',
        phone: '+966 50 999 8888',
        role: 'UI/UX Designer',
        department: 'Design',
        team: 'Creative Team',
        branchId: '1', // CHANGED from 'branch-1' to '1'
        floorId: 'floor-1',
        joinDate: '2023-03-10',
        supervisorName: 'Omar Khalid',
        skills: ['Figma', 'Adobe XD', 'Prototyping'],
        kpis: {
            tasksCompleted: 30,
            tasksTotal: 30,
            attendanceRate: 98,
            performanceScore: 95,
            productivityScore: 91
        },
        recentReports: []
    }
];

const mockTeams: TeamData[] = [
    {
        id: 'team-1',
        name: 'Backend Team',
        department: 'Engineering',
        branchId: '1', // CHANGED
        leaderName: 'Sara Mohamed',
        memberCount: 8,
        members: ['emp-1'],
        kpis: {
            avgPerformance: 87,
            tasksCompleted: 120,
            tasksTotal: 140,
            productivity: 85
        }
    },
    {
        id: 'team-2',
        name: 'Creative Team',
        department: 'Design',
        branchId: '1', // CHANGED
        leaderName: 'Fatima Ali',
        memberCount: 4,
        members: ['emp-2'],
        kpis: {
            avgPerformance: 92,
            tasksCompleted: 40,
            tasksTotal: 45,
            productivity: 90
        }
    }
];

const mockDepartments: DepartmentData[] = [
    {
        id: 'dept-1',
        name: 'Engineering',
        branchId: '1', // CHANGED
        headName: 'Omar Khalid',
        employeeCount: 45,
        teamCount: 5,
        kpis: {
            revenue: 850000,
            revenueTarget: 1000000,
            tasksCompleted: 340,
            tasksTotal: 400,
            efficiency: 88,
            satisfaction: 85
        }
    },
    {
        id: 'dept-2',
        name: 'Design',
        branchId: '1', // CHANGED
        headName: 'Laila Ahmed',
        employeeCount: 12,
        teamCount: 2,
        kpis: {
            revenue: 200000,
            revenueTarget: 250000,
            tasksCompleted: 100,
            tasksTotal: 110,
            efficiency: 95,
            satisfaction: 92
        }
    }
];

// --- API FUNCTIONS ---

// Helper to make string/number comparison safer
// This ensures "1" (string) matches 1 (number) or "1" (string)
const isMatch = (id1: string | number, id2: string | number) => {
    return String(id1) === String(id2);
};

// Get employees by branch
export const getEmployeesByBranch = (branchId: string): Promise<EmployeeDetail[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const filtered = mockEmployees.filter(e => isMatch(e.branchId, branchId));
            resolve(filtered);
        }, 300);
    });
};

// Get single employee
export const getEmployeeById = (employeeId: string): Promise<EmployeeDetail> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const employee = mockEmployees.find(e => e.id === employeeId);
            if (employee) resolve(employee);
            else reject(new Error('Employee not found'));
        }, 300);
    });
};

// Get teams by branch
export const getTeamsByBranch = (branchId: string): Promise<TeamData[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const filtered = mockTeams.filter(t => isMatch(t.branchId, branchId));
            resolve(filtered);
        }, 300);
    });
};

// Get departments by branch
export const getDepartmentsByBranch = (branchId: string): Promise<DepartmentData[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const filtered = mockDepartments.filter(d => isMatch(d.branchId, branchId));
            resolve(filtered);
        }, 300);
    });
};

// Download attendance report
export const downloadAttendanceReport = (employeeId: string): Promise<Blob> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const blob = new Blob(['Attendance report data'], { type: 'application/pdf' });
            resolve(blob);
        }, 500);
    });
};

// Download employee report
export const downloadEmployeeReport = (reportId: string): Promise<Blob> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const blob = new Blob(['Report data'], { type: 'application/pdf' });
            resolve(blob);
        }, 500);
    });
};