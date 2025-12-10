import { api } from "./api";

// Type definitions
type Kpi = {
    title?: string;
    value: number;
    target?: number;
    unit?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    explanation?: string;
    color?: string;
    code?: string;
    label?: string;
    name?: string;
    [key: string]: any;
};

/**
 * Fetch global KPI insights
 */
export const fetchInsightsKpis = async (): Promise<Kpi[]> => {
    try {
        const response = await api.get('/api/insights');
        console.log('Insights KPIs Response:', response.data);
        
        const data = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
        
        return data;
    } catch (error) {
        console.error('Error fetching insights KPIs:', error);
        throw error;
    }
};

/**
 * Fetch trend data (historical analytics)
 */
export const fetchTrends = async (): Promise<any[]> => {
    try {
        const response = await api.get('/api/analytics/trends');
        console.log('Trends Response:', response.data);
        
        const data = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
        
        return data;
    } catch (error) {
        console.error('Error fetching trends:', error);
        throw error;
    }
};

/**
 * Fetch employee changes data
 */
export const fetchEmployeeChanges = async (): Promise<any> => {
    try {
        const response = await api.get('/api/analytics/employee-changes');
        console.log('Employee Changes Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching employee changes:', error);
        throw error;
    }
};

/**
 * Fetch task metrics
 */
export const fetchTaskMetrics = async (): Promise<any[]> => {
    try {
        const response = await api.get('/api/analytics/task-metrics');
        console.log('Task Metrics Response:', response.data);
        
        const data = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
        
        return data;
    } catch (error) {
        console.error('Error fetching task metrics:', error);
        throw error;
    }
};

/**
 * Fetch branch comparison data
 */
export const fetchBranchComparison = async (): Promise<any[]> => {
    try {
        const response = await api.get('/api/analytics/branch-comparison');
        console.log('Branch Comparison Response:', response.data);
        
        const data = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
        
        return data;
    } catch (error) {
        console.error('Error fetching branch comparison:', error);
        throw error;
    }
};

/**
 * Fetch top performing employees
 */
export const fetchTopEmployees = async (): Promise<any[]> => {
    try {
        const response = await api.get('/api/analytics/top-employees');
        console.log('Top Employees Response:', response.data);
        
        const data = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
        
        return data;
    } catch (error) {
        console.error('Error fetching top employees:', error);
        throw error;
    }
};

/**
 * Fetch employee performance history (30 days)
 */
export const fetchEmployeePerformance = async (employeeId: number): Promise<any[]> => {
    try {
        const response = await api.get(`/api/analytics/employee/${employeeId}/performance`);
        console.log('Employee Performance Response:', response.data);
        
        const data = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
        
        return data;
    } catch (error) {
        console.error('Error fetching employee performance:', error);
        throw error;
    }
};
