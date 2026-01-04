import type { BranchAnalytics, EmployeeAnalytics, FloorAnalytics } from "../../model/analytics";
import { api } from "./api";

// ============================================================
// TYPES & INTERFACES
// ============================================================
// ============================================================
// BRANCH ANALYTICS
// ============================================================

/**
 * Get live analytics for a specific branch
 */
export const getBranchAnalytics = async (branchId: string): Promise<BranchAnalytics> => {
    try {
        const response = await api.get(`/api/analytics/branch/${branchId}`);
        const data = response.data.data || response.data;
        
        return {
            id: data.id?.toString() || '',
            branchId: branchId,
            date: data.attributes?.date || data.date || new Date().toISOString().split('T')[0],
            revenue: parseFloat(data.attributes?.revenue || data.revenue || 0),
            revenueTarget: parseFloat(data.attributes?.revenueTarget || data.revenueTarget || 0),
            productivityScore: parseFloat(data.attributes?.productivityScore || data.productivityScore || 0),
            satisfactionScore: parseFloat(data.attributes?.satisfactionScore || data.satisfactionScore || 0),
            growthRate: parseFloat(data.attributes?.growthRate || data.growthRate || 0),
            performanceRating: (data.attributes?.performanceRating || data.performanceRating || 'average') as 'excellent' | 'good' | 'average' | 'poor',
            employeeCount: parseInt(data.attributes?.employeeCount || data.employeeCount || 0),
            joinedCount: parseInt(data.attributes?.joinedCount || data.joinedCount || 0),
            leftCount: parseInt(data.attributes?.leftCount || data.leftCount || 0)
        };
    } catch (error) {
        console.error(`Error fetching branch analytics for ${branchId}:`, error);
        throw error;
    }
};

/**
 * Get historical data for a branch within a date range
 */
export const getBranchHistory = async (
    branchId: string, 
    fromDate: string, 
    toDate: string
): Promise<BranchAnalytics[]> => {
    try {
        const response = await api.get(`/api/analytics/branch/${branchId}/history`, {
            params: { from: fromDate, to: toDate }
        });
        
        const data = response.data.data || response.data;
        const historyArray = Array.isArray(data) ? data : [data];
        
        return historyArray.map((item: any) => ({
            id: item.id?.toString() || '',
            branchId: branchId,
            date: item.attributes?.date || item.date || '',
            revenue: parseFloat(item.attributes?.revenue || item.revenue || 0),
            revenueTarget: parseFloat(item.attributes?.revenueTarget || item.revenueTarget || 0),
            productivityScore: parseFloat(item.attributes?.productivityScore || item.productivityScore || 0),
            satisfactionScore: parseFloat(item.attributes?.satisfactionScore || item.satisfactionScore || 0),
            growthRate: parseFloat(item.attributes?.growthRate || item.growthRate || 0),
            performanceRating: (item.attributes?.performanceRating || item.performanceRating || 'average') as 'excellent' | 'good' | 'average' | 'poor',
            employeeCount: parseInt(item.attributes?.employeeCount || item.employeeCount || 0),
            joinedCount: parseInt(item.attributes?.joinedCount || item.joinedCount || 0),
            leftCount: parseInt(item.attributes?.leftCount || item.leftCount || 0)
        }));
    } catch (error) {
        console.error(`Error fetching branch history for ${branchId}:`, error);
        throw error;
    }
};

// ============================================================
// FLOOR ANALYTICS
// ============================================================

/**
 * Get live analytics for a specific floor
 */
export const getFloorAnalytics = async (floorId: string): Promise<FloorAnalytics> => {
    try {
        const response = await api.get(`/api/analytics/floor/${floorId}`);
        const data = response.data.data || response.data;
        
        return {
            id: data.id?.toString() || '',
            floorId: floorId,
            date: data.attributes?.date || data.date || new Date().toISOString().split('T')[0],
            occupancyRate: parseFloat(data.attributes?.occupancyRate || data.occupancyRate || 0),
            productivityScore: parseFloat(data.attributes?.productivityScore || data.productivityScore || 0)
        };
    } catch (error) {
        console.error(`Error fetching floor analytics for ${floorId}:`, error);
        throw error;
    }
};

/**
 * Get historical data for a floor within a date range
 */
export const getFloorHistory = async (
    floorId: string, 
    fromDate: string, 
    toDate: string
): Promise<FloorAnalytics[]> => {
    try {
        const response = await api.get(`/api/analytics/floor/${floorId}/history`, {
            params: { from: fromDate, to: toDate }
        });
        
        const data = response.data.data || response.data;
        const historyArray = Array.isArray(data) ? data : [data];
        
        return historyArray.map((item: any) => ({
            id: item.id?.toString() || '',
            floorId: floorId,
            date: item.attributes?.date || item.date || '',
            occupancyRate: parseFloat(item.attributes?.occupancyRate || item.occupancyRate || 0),
            productivityScore: parseFloat(item.attributes?.productivityScore || item.productivityScore || 0)
        }));
    } catch (error) {
        console.error(`Error fetching floor history for ${floorId}:`, error);
        throw error;
    }
};

// ============================================================
// EMPLOYEE ANALYTICS
// ============================================================

/**
 * Get live analytics for a specific employee
 */
export const getEmployeeAnalytics = async (employeeId: string): Promise<EmployeeAnalytics> => {
    try {
        const response = await api.get(`/api/analytics/employee/${employeeId}`);
        const data = response.data.data || response.data;
        
        return {
            id: data.id?.toString() || '',
            employeeId: employeeId,
            date: data.attributes?.date || data.date || new Date().toISOString().split('T')[0],
            tasksCompleted: parseInt(data.attributes?.tasksCompleted || data.tasksCompleted || 0),
            tasksTotal: parseInt(data.attributes?.tasksTotal || data.tasksTotal || 0),
            attendanceRate: parseFloat(data.attributes?.attendanceRate || data.attendanceRate || 0),
            performanceScore: parseFloat(data.attributes?.performanceScore || data.performanceScore || 0),
            productivityScore: parseFloat(data.attributes?.productivityScore || data.productivityScore || 0),
            projectsCompleted: parseInt(data.attributes?.projectsCompleted || data.projectsCompleted || 0)
        };
    } catch (error) {
        console.error(`Error fetching employee analytics for ${employeeId}:`, error);
        throw error;
    }
};

/**
 * Get historical data for an employee within a date range
 */
export const getEmployeeHistory = async (
    employeeId: string, 
    fromDate: string, 
    toDate: string
): Promise<EmployeeAnalytics[]> => {
    try {
        const response = await api.get(`/api/analytics/employee/${employeeId}/history`, {
            params: { from: fromDate, to: toDate }
        });
        
        const data = response.data.data || response.data;
        const historyArray = Array.isArray(data) ? data : [data];
        
        return historyArray.map((item: any) => ({
            id: item.id?.toString() || '',
            employeeId: employeeId,
            date: item.attributes?.date || item.date || '',
            tasksCompleted: parseInt(item.attributes?.tasksCompleted || item.tasksCompleted || 0),
            tasksTotal: parseInt(item.attributes?.tasksTotal || item.tasksTotal || 0),
            attendanceRate: parseFloat(item.attributes?.attendanceRate || item.attendanceRate || 0),
            performanceScore: parseFloat(item.attributes?.performanceScore || item.performanceScore || 0),
            productivityScore: parseFloat(item.attributes?.productivityScore || item.productivityScore || 0),
            projectsCompleted: parseInt(item.attributes?.projectsCompleted || item.projectsCompleted || 0)
        }));
    } catch (error) {
        console.error(`Error fetching employee history for ${employeeId}:`, error);
        throw error;
    }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Generate date range for the last N days
 */
export const getDateRange = (days: number = 30): { fromDate: string; toDate: string } => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    return {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0]
    };
};

/**
 * Get default date range (last 30 days)
 */
export const getDefaultDateRange = () => getDateRange(30);
