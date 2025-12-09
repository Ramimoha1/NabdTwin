import { api } from "./api";
import type { Employee } from "../../model";

/**
 * Normalize backend employee data to match frontend Employee interface
 */
const normalizeEmployeeData = (rawEmployee: any): Employee => {
    const latestKpi = rawEmployee.attributes?.employeeKpis?.data?.[0]?.attributes;
    const attrs = rawEmployee.attributes;
    
    return {
        id: rawEmployee.id.toString(),
        name: `${attrs.firstName || ''} ${attrs.lastName || ''}`.trim() || 'Unknown Employee',
        role: attrs.jobTitle || 'Not specified',
        department: attrs.department?.data?.attributes?.name || 'Not assigned',
        workspaceId: attrs.workspace?.data?.id?.toString() || '',
        email: attrs.email || '',
        phone: attrs.phone || '',
        performance: {
            score: latestKpi?.performanceScore || 0,
            attendance: latestKpi?.attendanceRate || 0,
            projectsCompleted: latestKpi?.projectsCompleted || 0,
            tasksCompleted: latestKpi?.tasksCompleted || 0
        },
        avatar: attrs.profilePicture?.url || undefined
    };
};

/**
 * Fetch all employees
 */
export const getEmployees = async (): Promise<Employee[]> => {
    try {
        const response = await api.get('/api/employees', {
            params: {
                'populate[employeeKpis][sort]': 'date:desc',
                'populate[employeeKpis][pagination][limit]': 1,
                'populate[department]': true,
                'populate[workspace]': true,
                'populate[profilePicture]': true
            }
        });

        const employees = response.data.data || [];
        return employees.map(normalizeEmployeeData);
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

/**
 * Fetch employees by branch ID
 */
export const getEmployeesByBranch = async (branchId: string): Promise<Employee[]> => {
    try {
        const response = await api.get('/api/employees', {
            params: {
                'filters[branch][id][$eq]': branchId,
                'populate[employeeKpis][sort]': 'date:desc',
                'populate[employeeKpis][pagination][limit]': 1,
                'populate[department]': true,
                'populate[workspace]': true,
                'populate[profilePicture]': true
            }
        });

        const employees = response.data.data || [];
        return employees.map(normalizeEmployeeData);
    } catch (error) {
        console.error(`Error fetching employees for branch ${branchId}:`, error);
        throw error;
    }
};

/**
 * Fetch employees by floor ID
 */
export const getEmployeesByFloor = async (floorId: string): Promise<Employee[]> => {
    try {
        const response = await api.get('/api/employees', {
            params: {
                'filters[floor][id][$eq]': floorId,
                'populate[employeeKpis][sort]': 'date:desc',
                'populate[employeeKpis][pagination][limit]': 1,
                'populate[department]': true,
                'populate[workspace]': true,
                'populate[profilePicture]': true
            }
        });

        const employees = response.data.data || [];
        return employees.map(normalizeEmployeeData);
    } catch (error) {
        console.error(`Error fetching employees for floor ${floorId}:`, error);
        throw error;
    }
};

/**
 * Fetch employees by workspace ID
 */
export const getEmployeesByWorkspace = async (workspaceId: string): Promise<Employee[]> => {
    try {
        const response = await api.get('/api/employees', {
            params: {
                'filters[workspace][id][$eq]': workspaceId,
                'populate[employeeKpis][sort]': 'date:desc',
                'populate[employeeKpis][pagination][limit]': 1,
                'populate[department]': true,
                'populate[workspace]': true,
                'populate[profilePicture]': true
            }
        });

        const employees = response.data.data || [];
        return employees.map(normalizeEmployeeData);
    } catch (error) {
        console.error(`Error fetching employees for workspace ${workspaceId}:`, error);
        throw error;
    }
};

/**
 * Fetch a single employee by ID
 */
export const getEmployeeById = async (id: string): Promise<Employee> => {
    try {
        const response = await api.get(`/api/employees/${id}`, {
            params: {
                'populate[employeeKpis][sort]': 'date:desc',
                'populate[employeeKpis][pagination][limit]': 1,
                'populate[department]': true,
                'populate[workspace]': true,
                'populate[branch]': true,
                'populate[floor]': true,
                'populate[profilePicture]': true
            }
        });

        return normalizeEmployeeData(response.data.data);
    } catch (error) {
        console.error(`Error fetching employee ${id}:`, error);
        throw error;
    }
};
