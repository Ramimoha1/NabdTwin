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
