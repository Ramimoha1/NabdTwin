import { useState, useEffect } from 'react';
import type { Branch } from '../model/index.tsx';
import { Card } from '../externaluicomponents/Card';
import { Badge } from '../externaluicomponents/badge';
import { Button } from '../externaluicomponents/button';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import {
    getInsights,
    type Insight,
    type TrendData,
    type Recommendation,
    refreshInsights
} from '../services/API/insights.ts';
import { useQuery } from '@tanstack/react-query';
import { getBranches } from '../services/API/branches.ts';

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const { data: branches, isLoading: branchesLoading, isError: branchesError } = useQuery<Branch[]>({
        queryKey: ['branches'],
        queryFn: getBranches,
    });

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            setLoading(true);
            const data = await getInsights();
            setInsights(data.insights);
            setTrends(data.trends);
            setRecommendations(data.recommendations);
            setLastUpdated(data.lastUpdated);
        } catch (error) {
            toast.error('Failed to load insights');
            console.error('Error loading insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            toast.info('Refreshing AI insights...');
            const data = await refreshInsights();
            setInsights(data.insights);
            setTrends(data.trends);
            setRecommendations(data.recommendations);
            setLastUpdated(data.lastUpdated);
            toast.success('Insights refreshed successfully');
        } catch (error) {
            toast.error('Failed to refresh insights');
            console.error('Error refreshing insights:', error);
        } finally {
            setRefreshing(false);
        }
    };

    if (branchesLoading || loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading AI insights...</p>
                </div>
            </div>
        );
    }

    if (branchesError) {
        return <p>Error loading branches</p>
    }

    // Prepare data for charts
    const revenueData = branches.map(b => ({
        name: b.name.split(' ')[0],
        revenue: b.kpis.revenue / 1000,
        growth: b.kpis.growth
    }));

    const performanceData = branches.map(b => ({
        name: b.name.split(' ')[0],
        productivity: b.kpis.productivity,
        satisfaction: b.kpis.satisfaction
    }));

    const employeeDistribution = branches.map(b => ({
        name: b.name.split(' ')[0],
        value: b.kpis.employees
    }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'positive':
            case 'opportunity':
                return CheckCircle;
            case 'warning':
            case 'alert':
                return AlertTriangle;
            default:
                return TrendingUp;
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'positive':
                return { text: 'text-green-600', bg: 'bg-green-50' };
            case 'warning':
                return { text: 'text-orange-600', bg: 'bg-orange-50' };
            case 'opportunity':
                return { text: 'text-blue-600', bg: 'bg-blue-50' };
            case 'alert':
                return { text: 'text-red-600', bg: 'bg-red-50' };
            default:
                return { text: 'text-gray-600', bg: 'bg-gray-50' };
        }
    };

    const getImpactBadgeColor = (impact: string) => {
        switch (impact) {
            case 'High':
                return 'bg-red-100 text-red-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTrendIcon = (trend: string) => {
        return trend === 'up' ? TrendingUp : TrendingDown;
    };

    const getTrendColor = (trend: string) => {
        return trend === 'up' ? 'text-green-600' : 'text-red-600';
    };

    const formatLastUpdated = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full overflow-auto">
            {/* Header */}
            <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl mb-1">AI-Driven Insights</h1>
                        <p className="text-gray-600">
                            Intelligent analysis and recommendations for your organization
                        </p>
                        {lastUpdated && (
                            <p className="text-sm text-gray-500 mt-1">
                                Last updated: {formatLastUpdated(lastUpdated)}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-purple-100 text-purple-800">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Powered
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Key Insights */}
                <div>
                    <h2 className="text-xl mb-4">Key Insights</h2>
                    {insights.length === 0 ? (
                        <Card className="p-6 text-center">
                            <p className="text-gray-600">No insights available at the moment.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {insights.map((insight) => {
                                const Icon = getInsightIcon(insight.type);
                                const colors = getInsightColor(insight.type);
                                return (
                                    <Card key={insight.id} className="p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${colors.bg}`}>
                                                <Icon className={`h-6 w-6 ${colors.text}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="mb-1">{insight.title}</h3>
                                                    <Badge className={getImpactBadgeColor(insight.impact)}>
                                                        {insight.impact} Impact
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600">{insight.description}</p>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Revenue Analysis */}
                <div>
                    <h2 className="text-xl mb-4">Revenue & Growth Analysis</h2>
                    <Card className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" label={{ value: 'Revenue (K)', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" label={{ value: 'Growth %', angle: 90, position: 'insideRight' }} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue (K)" />
                                <Bar yAxisId="right" dataKey="growth" fill="#10b981" name="Growth %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Performance Comparison */}
                <div>
                    <h2 className="text-xl mb-4">Branch Performance Comparison</h2>
                    <Card className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={2} name="Productivity %" />
                                <Line type="monotone" dataKey="satisfaction" stroke="#f59e0b" strokeWidth={2} name="Satisfaction %" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Employee Distribution */}
                    <Card className="p-6">
                        <h3 className="mb-4">Employee Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={employeeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {employeeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Recommendations */}
                    <Card className="p-6">
                        <h3 className="mb-4">AI Recommendations</h3>
                        {recommendations.length === 0 ? (
                            <p className="text-gray-600 text-sm">No recommendations available.</p>
                        ) : (
                            <div className="space-y-4">
                                {recommendations.map((rec, index) => {
                                    const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600'];
                                    return (
                                        <div key={rec.id} className="flex items-start gap-3">
                                            <div className={`h-6 w-6 rounded-full ${colors[index % colors.length]} flex items-center justify-center flex-shrink-0`}>
                                                <span className="text-xs">{rec.priority}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm mb-1">{rec.title}</p>
                                                <p className="text-xs text-gray-500">Estimated impact: {rec.estimatedImpact}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Trend Analysis */}
                <div>
                    <h2 className="text-xl mb-4">Trend Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {trends.map((trend) => {
                            const TrendIcon = getTrendIcon(trend.trend);
                            const trendColor = getTrendColor(trend.trend);
                            return (
                                <Card key={trend.metric} className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 capitalize">{trend.metric} Trend</p>
                                            <p className="text-2xl mb-1">
                                                {trend.value > 0 ? '+' : ''}{trend.value}%
                                            </p>
                                        </div>
                                        <TrendIcon className={`h-6 w-6 ${trendColor}`} />
                                    </div>
                                    <p className="text-sm text-gray-600">{trend.description}</p>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}