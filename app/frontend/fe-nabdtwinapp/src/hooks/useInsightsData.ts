import { useQuery } from '@tanstack/react-query';
import {
    fetchInsightsKpis,
    fetchTrends,
    fetchEmployeeChanges,
    fetchTaskMetrics,
    fetchBranchComparison,
    fetchTopEmployees,
} from '../services/API/insightsService';

export function useInsightsData() {
    const { data: kpis = [], isLoading: isLoadingKpis } = useQuery({
        queryKey: ["insights-kpis"],
        queryFn: fetchInsightsKpis,
    });

    const { data: trendData = [], isLoading: isLoadingTrends } = useQuery({
        queryKey: ["insights-trends"],
        queryFn: fetchTrends,
    });

    const { data: employeeChanges = { joined: { count: 0, change: '+0', trend: 'up', details: [] }, resigned: { count: 0, change: '-0', trend: 'down', details: [] } }, isLoading: isLoadingEmpChanges } = useQuery({
        queryKey: ["insights-employee-changes"],
        queryFn: fetchEmployeeChanges,
    });

    const { data: taskMetrics = [], isLoading: isLoadingTaskMetrics } = useQuery({
        queryKey: ["insights-task-metrics"],
        queryFn: fetchTaskMetrics,
    });

    const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
        queryKey: ["insights-branches"],
        queryFn: fetchBranchComparison,
    });

    const { data: topEmployees = [], isLoading: isLoadingTopEmployees } = useQuery({
        queryKey: ["insights-top-employees"],
        queryFn: fetchTopEmployees,
    });

    const isLoading = isLoadingKpis || isLoadingTrends || isLoadingEmpChanges ||
        isLoadingTaskMetrics || isLoadingBranches || isLoadingTopEmployees;

    return {
        kpis,
        trendData,
        employeeChanges,
        taskMetrics,
        branches,
        topEmployees,
        isLoading,
    };
}