import type { DepartmentData } from '../../model';
import { api } from './api';

// Fallback mock data for development
const mockDepartments: DepartmentData[] = [
    {
        id: 'dept-1',
        name: 'Engineering',
        headName: 'Dr. Evelyn Reed',
        employeeCount: 25,
        teamCount: 4,
        kpis: {
            efficiency: 92,
            satisfaction: 88,
            revenue: 500000,
            revenueTarget: 450000,
            tasksCompleted: 120,
            tasksTotal: 130,
        },
    },
    {
        id: 'dept-2',
        name: 'Marketing',
        headName: 'Leo Carter',
        employeeCount: 15,
        teamCount: 2,
        kpis: {
            efficiency: 85,
            satisfaction: 91,
            revenue: 750000,
            revenueTarget: 700000,
            tasksCompleted: 80,
            tasksTotal: 90,
        },
    },
];

/**
 * Transform Strapi department (v4 REST shape) to frontend DepartmentData
 */
function transformDepartment(deptData: any): DepartmentData {
    const attrs = deptData?.attributes ?? deptData;
    const head = attrs?.headEmployee?.data?.attributes;
    const branchId = attrs?.branch?.data?.id ? String(attrs.branch.data.id) : undefined;
    const employees = attrs?.employees?.data ?? [];

    // Aggregate simple KPIs from employees (if employeeKpis are populated elsewhere)
    let tasksCompleted = 0;
    let tasksTotal = 0;
    let performanceSum = 0;
    let perfCount = 0;

    for (const emp of employees) {
        const eAttrs = emp?.attributes ?? emp;
        const kpis = eAttrs?.employeeKpis?.data ?? [];
        const latest = kpis[0]?.attributes ?? kpis[0];
        if (latest) {
            tasksCompleted += latest.tasksCompleted ?? 0;
            tasksTotal += latest.tasksTotal ?? 0;
            performanceSum += latest.performanceScore ?? 0;
            perfCount++;
        }
    }

    const avgPerformance = perfCount > 0 ? Math.round(performanceSum / perfCount) : 88;

    return {
        id: String(deptData.id),
        name: attrs?.name || 'Unknown',
        headName: head?.firstName
            ? `${head.firstName} ${head.lastName || ''}`.trim()
            : 'Manager TBD',
        branchId,
        employeeCount: employees.length,
        teamCount: 1,
        kpis: {
            efficiency: avgPerformance,
            satisfaction: 86,
            revenue: 0,
            revenueTarget: 0,
            tasksCompleted: tasksCompleted,
            tasksTotal: tasksTotal || 1,
        },
    };
}

export async function getDepartments(filters?: { branchId?: string }): Promise<DepartmentData[]> {
    try {
        // Try to fetch from backend
        const response = await api.get('api/departments', {
            params: {
                populate: ['headEmployee', 'branch', 'employees'],
                ...(filters?.branchId && { 'filters[branch][id][$eq]': filters.branchId }),
            },
        });

        const departments = response.data?.data || [];
        console.log(`✅ Loaded ${departments.length} departments from backend`);
        return departments.map(transformDepartment);
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using mock departments:', error instanceof Error ? error.message : '');
        return mockDepartments;
    }
}

export async function getDepartment(id: string): Promise<DepartmentData | undefined> {
    try {
        // Try to fetch from backend
        const response = await api.get(`api/departments/${id}`, {
            params: {
                populate: ['headEmployee', 'branch', 'employees'],
            },
        });

        const dept = response.data?.data;
        if (dept) {
            console.log(`✅ Loaded department ${id} from backend`);
            return transformDepartment(dept);
        }
    } catch (error) {
        console.warn(`⚠️ Backend unavailable for department ${id}, using mock data:`, error instanceof Error ? error.message : '');
    }
    return mockDepartments.find(dept => dept.id === id);
}
