import type { DepartmentData, EmployeeDetail, TeamData } from "../../model";
import { api } from "./api";

// Export interfaces for API responses
export interface EmployeeDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    departmentId?: string;
    department?: string;
    teamId?: string;
    team?: string;
    branchId: string;
    floorId?: string;
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
    departmentId?: string;
    branchId: string;
    leaderName: string;
    memberCount: number;
    members: string[];
    kpis: {
        avgPerformance: number;
        tasksCompleted: number;
        tasksTotal: number;
        productivity: number;
    };
}

export interface DepartmentData {
    id: string;
    name: string;
    branchId: string;
    headName: string;
    employeeCount: number;
    teamCount: number;
    kpis: {
        revenue: number;
        revenueTarget: number;
        tasksCompleted: number;
        tasksTotal: number;
        efficiency: number;
        satisfaction: number;
    };
}

export interface BranchDetailsResponse {
    branch: {
        id: string;
        name: string;
        location: {
            address: string;
            city: string;
            country: string;
            latitude: number;
            longitude: number;
        };
        kpis: {
            revenue: number;
            growth: number;
            satisfaction: number;
            productivity: number;
        };
    };
    employees: EmployeeDetail[];
    teams: TeamData[];
    departments: DepartmentData[];
}

// --- API FUNCTIONS ---

/**
 * Get branch details with employees, teams, and departments
 * Fetches all related data from the backend API in one call
 */
export const getBranchDetails = async (branchId: string): Promise<BranchDetailsResponse> => {
    try {
        const response = await api.get(`/branches/${branchId}/details`);
        return response.data;
    } catch (error) {
        console.error('Error fetching branch details:', error);
        throw error;
    }
};

// Get employees by branch
export const getEmployeesByBranch = async (branchId: string): Promise<EmployeeDetail[]> => {
    try {
        const response = await api.get('/employees', {
            params: {
                filters: { branch_id: { $eq: branchId } },
                populate: ['department', 'team', 'kpis'],
                sort: 'first_name:asc',
            }
        });
        
        return response.data.data.map((emp: any) => ({
            id: emp.id,
            firstName: emp.attributes.first_name,
            lastName: emp.attributes.last_name,
            email: emp.attributes.email,
            phone: emp.attributes.phone,
            role: emp.attributes.job_title,
            departmentId: emp.attributes.department?.data?.id,
            department: emp.attributes.department?.data?.attributes?.name,
            teamId: emp.attributes.team?.data?.id,
            team: emp.attributes.team?.data?.attributes?.name,
            branchId: emp.attributes.branch_id,
            floorId: emp.attributes.workspace?.data?.attributes?.floor_id,
            kpis: emp.attributes.kpis?.data?.[0]?.attributes
                ? {
                    performanceScore: emp.attributes.kpis.data[0].attributes.performance_score || 0,
                    tasksCompleted: emp.attributes.kpis.data[0].attributes.tasks_completed || 0,
                    tasksTotal: emp.attributes.kpis.data[0].attributes.tasks_total || 0,
                    attendanceRate: emp.attributes.kpis.data[0].attributes.attendance_rate || 0,
                    productivityScore: emp.attributes.kpis.data[0].attributes.productivity_score || 0,
                }
                : {
                    performanceScore: 0,
                    tasksCompleted: 0,
                    tasksTotal: 0,
                    attendanceRate: 0,
                    productivityScore: 0,
                },
        }));
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

// Get single employee
export const getEmployeeById = async (employeeId: string): Promise<EmployeeDetail> => {
    try {
        const response = await api.get(`/employees/${employeeId}`, {
            params: {
                populate: ['department', 'team', 'kpis', 'workspace'],
            }
        });
        
        const emp = response.data.data;
        return {
            id: emp.id,
            firstName: emp.attributes.first_name,
            lastName: emp.attributes.last_name,
            email: emp.attributes.email,
            phone: emp.attributes.phone,
            role: emp.attributes.job_title,
            departmentId: emp.attributes.department?.data?.id,
            department: emp.attributes.department?.data?.attributes?.name,
            teamId: emp.attributes.team?.data?.id,
            team: emp.attributes.team?.data?.attributes?.name,
            branchId: emp.attributes.branch_id,
            floorId: emp.attributes.workspace?.data?.attributes?.floor_id,
            kpis: emp.attributes.kpis?.data?.[0]?.attributes
                ? {
                    performanceScore: emp.attributes.kpis.data[0].attributes.performance_score || 0,
                    tasksCompleted: emp.attributes.kpis.data[0].attributes.tasks_completed || 0,
                    tasksTotal: emp.attributes.kpis.data[0].attributes.tasks_total || 0,
                    attendanceRate: emp.attributes.kpis.data[0].attributes.attendance_rate || 0,
                    productivityScore: emp.attributes.kpis.data[0].attributes.productivity_score || 0,
                }
                : {
                    performanceScore: 0,
                    tasksCompleted: 0,
                    tasksTotal: 0,
                    attendanceRate: 0,
                    productivityScore: 0,
                },
        };
    } catch (error) {
        console.error('Error fetching employee:', error);
        throw error;
    }
};

// Get teams by branch
export const getTeamsByBranch = async (branchId: string): Promise<TeamData[]> => {
    try {
        const response = await api.get('/teams', {
            params: {
                filters: { branch_id: { $eq: branchId } },
                populate: ['department', 'leader_employee', 'kpis'],
                sort: 'name:asc',
            }
        });
        
        return response.data.data.map((team: any) => ({
            id: team.id,
            name: team.attributes.name,
            department: team.attributes.department?.data?.attributes?.name,
            departmentId: team.attributes.department?.data?.id,
            branchId: team.attributes.branch_id,
            leaderName: team.attributes.leader_employee?.data?.attributes
                ? `${team.attributes.leader_employee.data.attributes.first_name} ${team.attributes.leader_employee.data.attributes.last_name}`
                : 'N/A',
            memberCount: team.attributes.member_count || 0,
            members: team.attributes.members?.data?.map((m: any) => m.id) || [],
            kpis: team.attributes.kpis?.data?.[0]?.attributes
                ? {
                    avgPerformance: team.attributes.kpis.data[0].attributes.avg_performance_score || 0,
                    tasksCompleted: team.attributes.kpis.data[0].attributes.tasks_completed || 0,
                    tasksTotal: team.attributes.kpis.data[0].attributes.tasks_total || 0,
                    productivity: team.attributes.kpis.data[0].attributes.productivity_score || 0,
                }
                : {
                    avgPerformance: 0,
                    tasksCompleted: 0,
                    tasksTotal: 0,
                    productivity: 0,
                },
        }));
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
};

// Get departments by branch
export const getDepartmentsByBranch = async (branchId: string): Promise<DepartmentData[]> => {
    try {
        const response = await api.get('/departments', {
            params: {
                filters: { branch_id: { $eq: branchId } },
                populate: ['head_employee', 'kpis'],
                sort: 'name:asc',
            }
        });
        
        return response.data.data.map((dept: any) => ({
            id: dept.id,
            name: dept.attributes.name,
            branchId: dept.attributes.branch_id,
            headName: dept.attributes.head_employee?.data?.attributes
                ? `${dept.attributes.head_employee.data.attributes.first_name} ${dept.attributes.head_employee.data.attributes.last_name}`
                : 'N/A',
            employeeCount: dept.attributes.employee_count || 0,
            teamCount: dept.attributes.team_count || 0,
            kpis: dept.attributes.kpis?.data?.[0]?.attributes
                ? {
                    revenue: dept.attributes.kpis.data[0].attributes.revenue || 0,
                    revenueTarget: dept.attributes.kpis.data[0].attributes.revenue_target || 0,
                    tasksCompleted: dept.attributes.kpis.data[0].attributes.tasks_completed || 0,
                    tasksTotal: dept.attributes.kpis.data[0].attributes.tasks_total || 0,
                    efficiency: dept.attributes.kpis.data[0].attributes.efficiency_score || 0,
                    satisfaction: dept.attributes.kpis.data[0].attributes.satisfaction_score || 0,
                }
                : {
                    revenue: 0,
                    revenueTarget: 0,
                    tasksCompleted: 0,
                    tasksTotal: 0,
                    efficiency: 0,
                    satisfaction: 0,
                },
        }));
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
};

// Download attendance report (mock for now - can be connected to real PDF generation)
export const downloadAttendanceReport = async (employeeId: string): Promise<Blob> => {
    try {
        const response = await api.get(`/employees/${employeeId}/attendance-report`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading attendance report:', error);
        // Fallback to mock data if endpoint not available
        return new Blob(['Attendance report data'], { type: 'application/pdf' });
    }
};

// Download employee report (mock for now - can be connected to real PDF generation)
export const downloadEmployeeReport = async (reportId: string): Promise<Blob> => {
    try {
        const response = await api.get(`/reports/${reportId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading report:', error);
        // Fallback to mock data if endpoint not available
        return new Blob(['Report data'], { type: 'application/pdf' });
    }
};