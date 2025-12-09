import { api } from "./api";
import type { Branch } from "../../model";

/**
 * Normalize backend branch data to match frontend Branch interface
 */
const normalizeBranchData = (rawBranch: any): Branch => {
    // Handle both Strapi v4 (with attributes) and direct object format
    const branch = rawBranch.attributes || rawBranch;
    
    // Get the latest KPI if available - branchKpis can be array or object
    const branchKpis = branch.branchKpis?.data || branch.branchKpis;
    const latestKpi = Array.isArray(branchKpis) && branchKpis.length > 0 
        ? (branchKpis[0]?.attributes || branchKpis[0])
        : (branchKpis?.attributes || branchKpis);
    
    return {
        id: (rawBranch.id || rawBranch.documentId || '').toString(),
        name: branch.name || 'Unknown Branch',
        location: {
            lat: parseFloat(branch.latitude) || 0,
            lng: parseFloat(branch.longitude) || 0,
            address: branch.address || ''
        },
        kpis: {
            revenue: latestKpi?.revenue || 0,
            employees: latestKpi?.employeeCount || branch.totalEmployees || 0,
            satisfaction: latestKpi?.satisfactionScore || 0,
            productivity: latestKpi?.productivityScore || 0,
            growth: latestKpi?.growthRate || 0
        },
        floors: [], // Populated separately if needed
        performance: (latestKpi?.performanceRating || 'average') as 'excellent' | 'good' | 'average' | 'poor',
        totalFloors: branch.totalFloors || 0,
        totalEmployees: branch.totalEmployees || 0
    };
};

/**
 * Fetch all branches with their latest KPIs
 */
export const getBranches = async (): Promise<Branch[]> => {
    try {
        const response = await api.get('/api/branches', {
            params: {
                populate: 'branchKpis'
            }
        });

        console.log('Branches API Response:', response.data); // Debug log
        const branches = response.data.data || response.data || [];
        return branches.map(normalizeBranchData);
    } catch (error) {
        console.error('Error fetching branches:', error);
        throw error;
    }
};

/**
 * Fetch a single branch by ID with populated data
 */
export const getBranchById = async (id: string): Promise<Branch> => {
    try {
        const response = await api.get(`/api/branches/${id}`, {
            params: {
                populate: ['branchKpis', 'floors']
            }
        });

        return normalizeBranchData(response.data.data);
    } catch (error) {
        console.error(`Error fetching branch ${id}:`, error);
        throw error;
    }
};
export const getBranchByIdKPI = async (id: string): Promise<Branch | null> => {
    try {
        const response = await api.get('/api/branches', {
            params: {
                populate: 'branchKpis',
                filters: {
                    id: id
                }
            }
        });

        console.log('Branch by ID Response:', response.data);

        const branches = response.data.data || [];
        return branches.length > 0 ? normalizeBranchData(branches[0]) : null;
    } catch (error) {
        console.error('Error fetching branch by ID:', error);
        throw error;
    }
};
