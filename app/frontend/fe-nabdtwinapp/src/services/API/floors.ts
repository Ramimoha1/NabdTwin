import { api } from "./api";
import type { Floor } from "../../model";

/**
 * Normalize backend floor data to match frontend Floor interface
 */
const normalizeFloorData = (rawFloor: any): Floor => {
    const latestKpi = rawFloor.attributes?.floorKpis?.data?.[0]?.attributes;
    
    return {
        id: rawFloor.id.toString(),
        branchId: rawFloor.attributes?.branch?.data?.id?.toString() || '',
        name: rawFloor.attributes.name || `Floor ${rawFloor.attributes.floorNumber || ''}`,
        number: rawFloor.attributes.floorNumber || 0,
        workspaces: [], // Populated separately if needed
        kpis: {
            occupancy: latestKpi?.occupancyRate || 0,
            productivity: latestKpi?.productivityScore || 0,
            satisfaction: 0 // Floor doesn't have satisfaction in backend, can add later
        }
    };
};

/**
 * Fetch all floors
 */
export const getFloors = async (): Promise<Floor[]> => {
    try {
        const response = await api.get('/api/floors', {
            params: {
                'populate[floorKpis][sort]': 'date:desc',
                'populate[floorKpis][pagination][limit]': 1,
                'populate[branch]': true
            }
        });

        const floors = response.data.data || [];
        return floors.map(normalizeFloorData);
    } catch (error) {
        console.error('Error fetching floors:', error);
        throw error;
    }
};

/**
 * Fetch floors by branch ID
 */
export const getFloorsByBranch = async (branchId: string): Promise<Floor[]> => {
    try {
        const response = await api.get('/api/floors', {
            params: {
                'filters[branch][id][$eq]': branchId,
                'populate[floorKpis][sort]': 'date:desc',
                'populate[floorKpis][pagination][limit]': 1,
                'populate[branch]': true
            }
        });

        const floors = response.data.data || [];
        return floors.map(normalizeFloorData);
    } catch (error) {
        console.error(`Error fetching floors for branch ${branchId}:`, error);
        throw error;
    }
};

/**
 * Fetch a single floor by ID
 */
export const getFloorById = async (id: string): Promise<Floor> => {
    try {
        const response = await api.get(`/api/floors/${id}`, {
            params: {
                'populate[floorKpis][sort]': 'date:desc',
                'populate[floorKpis][pagination][limit]': 1,
                'populate[branch]': true,
                'populate[workspaces]': true
            }
        });

        return normalizeFloorData(response.data.data);
    } catch (error) {
        console.error(`Error fetching floor ${id}:`, error);
        throw error;
    }
};

/**
 * Get raw floor data (for Edit Visualization page)
 */
export const getFloorRawData = async (floorId: string) => {
    try {
        // First try to get by document ID, then fall back to numeric ID
        const response = await api.get(`/api/floors/${floorId}`, {
            params: {
                populate: '*'
            }
        });
        // API returns flat structure directly
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch floor:', error);
        throw error;
    }
};

/**
 * Get floors by branch (raw format for Edit Visualization)
 */
export const getFloorsByBranchRaw = async (branchId: string) => {
    try {
        const response = await api.get('/api/floors', {
            params: {
                'filters[branch][id][$eq]': branchId,
                populate: '*'
            }
        });
        
        // API returns flat structure, not nested attributes
        return response.data.data.map((item: any) => ({
            id: item.id,
            documentId: item.documentId,
            name: item.name,
            floorNumber: item.floorNumber,
            description: item.description,
            floors: item.floors
        }));
    } catch (error) {
        console.error('Failed to fetch floors by branch:', error);
        throw error;
    }
};

/**
 * Create a new floor
 */
export const createFloor = async (data: {
    name: string;
    floorNumber: number;
    description?: string;
    branch: string;
}) => {
    try {
        const response = await api.post('/api/floors', {
            data: {
                ...data,
                floors: null
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Failed to create floor:', error);
        throw error;
    }
};

/**
 * Update floor data (save floor plan)
 */
export const updateFloor = async (floorId: string, blueprintData: any) => {
    try {
        const response = await api.put(`/api/floors/${floorId}`, {
            data: {
                floors: JSON.stringify(blueprintData)
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Failed to update floor:', error);
        throw error;
    }
};

/**
 * Delete a floor
 */
export const deleteFloor = async (floorId: number) => {
    try {
        const response = await api.delete(`/api/floors/${floorId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete floor:', error);
        throw error;
    }
};
