export interface Branch {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    kpis: {
        revenue: number;
        employees: number;
        satisfaction: number;
        productivity: number;
        growth: number;
    };
    floors: Floor[];
    performance: 'excellent' | 'good' | 'average' | 'poor';
    totalFloors?: number;
    totalEmployees?: number;
}

export interface Floor {
    id: string;
    branchId: string;
    name: string;
    number: number;
    workspaces: Workspace[];
    kpis: {
        occupancy: number;
        productivity: number;
        satisfaction: number;
    };
}

export interface Workspace {
    id: string;
    floorId: string;
    name: string;
    type: 'office' | 'meeting' | 'open-space' | 'lab';
    employees: Employee[];
    kpis: {
        utilization: number;
        productivity: number;
        collaboration: number;
    };
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    departmentId?: string;
    workspaceId?: string;
    email: string;
    phone: string;
    teamId?: string;
    performance: {
        score: number;
        attendance: number;
        projectsCompleted: number;
        tasksCompleted: number;
    };
    avatar?: string;
}
