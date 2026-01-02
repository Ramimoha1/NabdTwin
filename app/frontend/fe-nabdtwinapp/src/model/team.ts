export interface TeamData {
    id: string;
    name: string;
    department: string;
    leaderName: string;
    memberCount: number;
    members: string[];
    kpis: {
        avgPerformance: number;
        productivity: number;
        tasksCompleted: number;
        tasksTotal: number;
    };
}
