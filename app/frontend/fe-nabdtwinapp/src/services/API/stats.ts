import { api } from "./api";
import type { DashboardStats, KPISummary, TrendData } from "../../model";
import { getBranches } from "./branches";
import { getEmployees } from "./employees";
import { getFloors } from "./floors";

/**
 * Calculate overall organization statistics from branches
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        // Fetch all data in parallel
        const [branches, employees, floors] = await Promise.all([
            getBranches(),
            getEmployees(),
            getFloors()
        ]);

        // Calculate aggregates
        const totalRevenue = branches.reduce((sum, branch) => sum + (branch.kpis.revenue || 0), 0);
        const avgProductivity = branches.length > 0 
            ? branches.reduce((sum, branch) => sum + (branch.kpis.productivity || 0), 0) / branches.length 
            : 0;
        const avgSatisfaction = branches.length > 0 
            ? branches.reduce((sum, branch) => sum + (branch.kpis.satisfaction || 0), 0) / branches.length 
            : 0;
        const revenueGrowth = branches.length > 0 
            ? branches.reduce((sum, branch) => sum + (branch.kpis.growth || 0), 0) / branches.length 
            : 0;

        return {
            totalBranches: branches.length,
            totalEmployees: employees.length,
            totalFloors: floors.length,
            avgProductivity: parseFloat(avgProductivity.toFixed(2)),
            avgSatisfaction: parseFloat(avgSatisfaction.toFixed(2)),
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            revenueGrowth: parseFloat(revenueGrowth.toFixed(2))
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

/**
 * Get top performing branches
 */
export const getTopBranches = async (limit: number = 5) => {
    try {
        const branches = await getBranches();
        
        // Sort by productivity score
        const sortedBranches = branches.sort((a, b) => 
            b.kpis.productivity - a.kpis.productivity
        );

        return sortedBranches.slice(0, limit);
    } catch (error) {
        console.error('Error fetching top branches:', error);
        throw error;
    }
};

/**
 * Get top performing employees
 */
export const getTopEmployees = async (limit: number = 10) => {
    try {
        const employees = await getEmployees();
        
        // Sort by performance score
        const sortedEmployees = employees.sort((a, b) => 
            b.performance.score - a.performance.score
        );

        return sortedEmployees.slice(0, limit);
    } catch (error) {
        console.error('Error fetching top employees:', error);
        throw error;
    }
};

/**
 * Calculate performance distribution across all branches
 */
export const getPerformanceDistribution = async () => {
    try {
        const branches = await getBranches();
        
        const distribution = {
            excellent: 0,
            good: 0,
            average: 0,
            poor: 0
        };

        branches.forEach(branch => {
            distribution[branch.performance]++;
        });

        return distribution;
    } catch (error) {
        console.error('Error calculating performance distribution:', error);
        throw error;
    }
};

/**
 * Calculate KPI summary with trends
 */
export const getKPISummary = async (): Promise<KPISummary[]> => {
    try {
        const stats = await getDashboardStats();

        return [
            {
                title: 'Total Revenue',
                value: stats.totalRevenue,
                unit: '$',
                status: stats.revenueGrowth >= 10 ? 'excellent' : 
                        stats.revenueGrowth >= 5 ? 'good' : 
                        stats.revenueGrowth >= 0 ? 'average' : 'poor'
            },
            {
                title: 'Average Productivity',
                value: stats.avgProductivity,
                unit: '%',
                status: stats.avgProductivity >= 90 ? 'excellent' : 
                        stats.avgProductivity >= 75 ? 'good' : 
                        stats.avgProductivity >= 60 ? 'average' : 'poor'
            },
            {
                title: 'Average Satisfaction',
                value: stats.avgSatisfaction,
                unit: '%',
                status: stats.avgSatisfaction >= 90 ? 'excellent' : 
                        stats.avgSatisfaction >= 75 ? 'good' : 
                        stats.avgSatisfaction >= 60 ? 'average' : 'poor'
            },
            {
                title: 'Total Employees',
                value: stats.totalEmployees,
                status: 'good'
            },
            {
                title: 'Total Branches',
                value: stats.totalBranches,
                status: 'good'
            }
        ];
    } catch (error) {
        console.error('Error fetching KPI summary:', error);
        throw error;
    }
};

/**
 * Get organization-wide metrics
 */
export const getOrganizationMetrics = async () => {
    try {
        const [stats, topBranches, performanceDistribution] = await Promise.all([
            getDashboardStats(),
            getTopBranches(5),
            getPerformanceDistribution()
        ]);

        return {
            stats,
            topBranches,
            performanceDistribution
        };
    } catch (error) {
        console.error('Error fetching organization metrics:', error);
        throw error;
    }
};
