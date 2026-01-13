import type { TeamData } from '../../model';
import { api } from './api';

// Fallback mock data for development
const mockTeams: TeamData[] = [
    {
        id: 'team-1',
        name: 'Alpha Team',
        department: 'Engineering',
        branchId: '1',
        leaderName: 'Jane Doe',
        memberCount: 5,
        members: ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'],
        kpis: {
            avgPerformance: 90,
            productivity: 85,
            tasksCompleted: 18,
            tasksTotal: 20,
        },
    },
    {
        id: 'team-2',
        name: 'Beta Team',
        department: 'Marketing',
        branchId: '1',
        leaderName: 'John Smith',
        memberCount: 4,
        members: ['emp-6', 'emp-7', 'emp-8', 'emp-9'],
        kpis: {
            avgPerformance: 75,
            productivity: 70,
            tasksCompleted: 10,
            tasksTotal: 15,
        },
    },
];

/**
 * Transform Strapi team (v4 REST shape) to frontend TeamData
 */
function transformTeam(teamData: any): TeamData {
    const attrs = teamData?.attributes ?? teamData;
    const deptName = attrs?.department?.data?.attributes?.name ?? 'Unknown';
    const branchId = attrs?.branch?.data?.id ? String(attrs.branch.data.id) : '1';
    const leader = attrs?.leaderEmployee?.data?.attributes;
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

    const avgPerformance = perfCount > 0 ? Math.round(performanceSum / perfCount) : 85;
    const productivity = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 82;

    return {
        id: String(teamData.id),
        name: attrs?.name || 'Unknown Team',
        department: deptName,
        branchId,
        leaderName: leader?.firstName
            ? `${leader.firstName} ${leader.lastName || ''}`.trim()
            : 'Team Lead TBD',
        memberCount: employees.length,
        members: employees.map((emp: any) => String(emp.id)),
        kpis: {
            avgPerformance,
            productivity,
            tasksCompleted,
            tasksTotal: tasksTotal || 1,
        },
    };
}

export async function getTeams(filters?: { departmentId?: string; branchId?: string }): Promise<TeamData[]> {
    try {
        // Try to fetch from backend
        const response = await api.get('api/teams', {
            params: {
                populate: ['department', 'branch', 'leaderEmployee', 'employees'],
                ...(filters?.departmentId && { 'filters[department][id][$eq]': filters.departmentId }),
                ...(filters?.branchId && { 'filters[branch][id][$eq]': filters.branchId }),
            },
        });

        const teams = response.data?.data || [];
        console.log(`✅ Loaded ${teams.length} teams from backend`);
        return teams.map(transformTeam);
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using mock teams:', error instanceof Error ? error.message : '');
        if (filters?.departmentId) {
            return mockTeams.filter(team => team.department === filters.departmentId);
        }
        return mockTeams;
    }
}

export async function getTeam(id: string): Promise<TeamData | undefined> {
    try {
        // Try to fetch from backend
        const response = await api.get(`api/teams/${id}`, {
            params: {
                populate: ['department', 'branch', 'leaderEmployee', 'employees'],
            },
        });

        const team = response.data?.data;
        if (team) {
            console.log(`✅ Loaded team ${id} from backend`);
            return transformTeam(team);
        }
    } catch (error) {
        console.warn(`⚠️ Backend unavailable for team ${id}, using mock data:`, error instanceof Error ? error.message : '');
    }
    return mockTeams.find(team => team.id === id);
}
