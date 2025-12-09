import { api } from "./api";

export interface Insight {
    id: number;
    type: 'positive' | 'warning' | 'opportunity' | 'alert';
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
    category: 'revenue' | 'productivity' | 'satisfaction' | 'workspace' | 'collaboration';
    branchIds?: string[];
    createdAt: string;
}

export interface TrendData {
    metric: 'revenue' | 'productivity' | 'satisfaction';
    value: number;
    trend: 'up' | 'down' | 'stable';
    description: string;
}

export interface Recommendation {
    id: number;
    title: string;
    description: string;
    estimatedImpact: string;
    priority: number;
    category: string;
}

export interface InsightsData {
    insights: Insight[];
    trends: TrendData[];
    recommendations: Recommendation[];
    lastUpdated: string;
}

// Mock insights data
const mockInsights: Insight[] = [
    {
        id: 1,
        type: 'positive',
        title: 'Strong Revenue Growth in Cairo HQ',
        description: 'Cairo Headquarters exceeded quarterly targets by 15.5%, showing exceptional performance across all departments.',
        impact: 'High',
        category: 'revenue',
        branchIds: ['branch-1'],
        createdAt: '2024-12-08T10:30:00Z'
    },
    {
        id: 2,
        type: 'warning',
        title: 'Productivity Decline in Aswan Branch',
        description: 'Aswan branch productivity has dropped to 65%, below the organizational average of 79%. Immediate action recommended.',
        impact: 'High',
        category: 'productivity',
        branchIds: ['branch-5'],
        createdAt: '2024-12-08T09:15:00Z'
    },
    {
        id: 3,
        type: 'opportunity',
        title: 'Employee Satisfaction Improvement',
        description: 'Overall employee satisfaction increased by 8% compared to last quarter across all branches.',
        impact: 'Medium',
        category: 'satisfaction',
        createdAt: '2024-12-07T14:20:00Z'
    },
    {
        id: 4,
        type: 'warning',
        title: 'Workspace Utilization Gap',
        description: 'Alexandria and Mansoura offices show underutilized workspace capacity. Consider workspace optimization.',
        impact: 'Medium',
        category: 'workspace',
        branchIds: ['branch-2', 'branch-4'],
        createdAt: '2024-12-07T11:45:00Z'
    },
    {
        id: 5,
        type: 'positive',
        title: 'Cross-Branch Collaboration Success',
        description: 'Inter-branch projects showed 23% higher completion rates, suggesting effective collaboration frameworks.',
        impact: 'Medium',
        category: 'collaboration',
        createdAt: '2024-12-06T16:30:00Z'
    }
];

const mockTrends: TrendData[] = [
    {
        metric: 'revenue',
        value: 12.4,
        trend: 'up',
        description: 'Consistent upward trend across all branches'
    },
    {
        metric: 'productivity',
        value: 5.8,
        trend: 'up',
        description: 'Improving with new workflow initiatives'
    },
    {
        metric: 'satisfaction',
        value: -2.1,
        trend: 'down',
        description: 'Slight decline; addressing in Q4 initiatives'
    }
];

const mockRecommendations: Recommendation[] = [
    {
        id: 1,
        title: 'Focus resources on Aswan branch to improve productivity metrics',
        description: 'Deploy additional training and support resources',
        estimatedImpact: '+12% productivity',
        priority: 1,
        category: 'productivity'
    },
    {
        id: 2,
        title: 'Replicate Cairo HQ\'s best practices across other branches',
        description: 'Document and implement successful workflows organization-wide',
        estimatedImpact: '+8% overall performance',
        priority: 2,
        category: 'performance'
    },
    {
        id: 3,
        title: 'Optimize workspace allocation in underutilized branches',
        description: 'Analyze usage patterns and reorganize office space',
        estimatedImpact: '$45K annually',
        priority: 3,
        category: 'cost-savings'
    },
    {
        id: 4,
        title: 'Increase inter-branch collaboration initiatives',
        description: 'Create more cross-branch project opportunities',
        estimatedImpact: '23% better project outcomes',
        priority: 4,
        category: 'collaboration'
    }
];

// Get all insights with trends and recommendations
export const getInsights = (): Promise<InsightsData> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                insights: mockInsights,
                trends: mockTrends,
                recommendations: mockRecommendations,
                lastUpdated: new Date().toISOString()
            });
        }, 300);
    });
    // return api.get("/insights").then(res => res.data);
};

// Get insights filtered by branch
export const getInsightsByBranch = (branchId: string): Promise<Insight[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const filtered = mockInsights.filter(
                insight => !insight.branchIds || insight.branchIds.includes(branchId)
            );
            resolve(filtered);
        }, 300);
    });
    // return api.get(`/insights/branch/${branchId}`).then(res => res.data);
};

// Get insights filtered by category
export const getInsightsByCategory = (category: string): Promise<Insight[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const filtered = mockInsights.filter(insight => insight.category === category);
            resolve(filtered);
        }, 300);
    });
    // return api.get(`/insights/category/${category}`).then(res => res.data);
};

// Get trend analysis
export const getTrends = (): Promise<TrendData[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockTrends), 300);
    });
    // return api.get("/insights/trends").then(res => res.data);
};

// Get AI recommendations
export const getRecommendations = (): Promise<Recommendation[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockRecommendations), 300);
    });
    // return api.get("/insights/recommendations").then(res => res.data);
};

// Refresh insights (trigger AI analysis)
export const refreshInsights = (): Promise<InsightsData> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                insights: mockInsights,
                trends: mockTrends,
                recommendations: mockRecommendations,
                lastUpdated: new Date().toISOString()
            });
        }, 1500); // Simulate longer processing time
    });
    // return api.post("/insights/refresh").then(res => res.data);
};