import type { TeamData } from '../../model';

// Mock data for teams
const mockTeams: TeamData[] = [
    {
        id: 'team-1',
        name: 'Alpha Team',
        department: 'Engineering',
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
    // Add more mock teams as needed
];

export async function getTeams(filters?: { departmentId?: string }): Promise<TeamData[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (filters?.departmentId) {
        // In a real app, you'd filter by department ID
        return mockTeams.filter(team => team.department === filters.departmentId);
    }
    return mockTeams;
}

export async function getTeam(id: string): Promise<TeamData | undefined> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTeams.find(team => team.id === id);
}
