import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '../externaluicomponents/Card';
import { Button } from '../externaluicomponents/button';
import { Badge } from '../externaluicomponents/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../externaluicomponents/select';
import { Input } from '../externaluicomponents/input';
import { Label } from '../externaluicomponents/label';
import { Switch } from '../externaluicomponents/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../externaluicomponents/dialog';
import MainPageHeader from "../components/MainPageHeader";
import {
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Bell,
    Settings,
    History,
    Plus,
    Trash2,
    Edit,
    Eye,
    MapPin,
} from 'lucide-react';
import { getActiveAlerts, dismissAlert, createAlertRule, getAlertRules, updateAlertRule, deleteAlertRule, getAlertHistory } from '../services/API/alertsApi';


interface AlertRule {
    id: string;
    kpiName: string;
    threshold: number;
    operator: 'less_than' | 'greater_than' | 'equals';
    alertType: 'warning' | 'critical';
    evaluationPeriod: 'daily' | 'weekly';
    enabled: boolean;
}


interface ActiveAlert {
    id: string;
    kpiName: string;
    currentValue: number;
    threshold: number;
    severity: 'warning' | 'critical';
    triggeredAt: string;
    description: string;
    branch?: string;
}


interface AlertHistoryItem {
    id: string;
    kpiName: string;
    severity: 'warning' | 'critical';
    triggeredAt: string;
    triggeredAtRaw: Date;
    resolvedAt: string;
    resolvedAtRaw: Date | null;
    acknowledgedBy: string;
    branch?: string;
}


export default function AlertsSummaryPage() {
    const [selectedAlert, setSelectedAlert] = useState<ActiveAlert | null>(null);
    const [showAlertDetails, setShowAlertDetails] = useState(false);
    const [showRuleManager, setShowRuleManager] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState({
        severity: 'all',
        dateRange: 'last7days',
        kpiType: 'all'
    });

    const [newRule, setNewRule] = useState({
        kpiName: 'Productivity',
        threshold: '',
        operator: 'less_than' as 'less_than' | 'greater_than' | 'equals',
        alertType: 'warning' as 'warning' | 'critical',
        evaluationPeriod: 'daily' as 'daily' | 'weekly' | 'monthly'
    });

    const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
    const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
    const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);

    // Load data from backend on component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Load active alerts
            const activeAlertsData = await getActiveAlerts();
            const formattedAlerts = activeAlertsData.map((alert: any) => ({
                id: alert.id,
                kpiName: alert.kpiName || 'Unknown KPI',
                currentValue: alert.currentValue || 0,
                threshold: alert.threshold || 0,
                severity: alert.severity as 'warning' | 'critical',
                triggeredAt: new Date(alert.createdAt).toLocaleString(),
                description: alert.description || '',
                branch: alert.branch?.name || undefined,
            }));
            setActiveAlerts(formattedAlerts);

            // Load alert rules
            const rulesData = await getAlertRules();
            console.log('Raw rules data:', rulesData);
            const formattedRules = rulesData.map((rule: any) => ({
                id: rule.documentId,  // Use documentId instead of id for API calls
                kpiName: rule.kpiName,
                threshold: rule.threshold,
                operator: rule.operator as 'less_than' | 'greater_than' | 'equals',
                alertType: rule.alertType as 'warning' | 'critical',
                evaluationPeriod: rule.evaluationPeriod as 'daily' | 'weekly',
                enabled: rule.enabled,
            }));
            console.log('Formatted rules:', formattedRules);
            setAlertRules(formattedRules);

            // Load alert history
            const historyData = await getAlertHistory();
            const formattedHistory = historyData.map((hist: any) => ({
                id: hist.id,
                kpiName: hist.kpiName || 'Unknown KPI',
                severity: hist.severity as 'warning' | 'critical',
                triggeredAt: new Date(hist.createdAt).toLocaleString(),
                triggeredAtRaw: new Date(hist.createdAt),
                resolvedAt: hist.resolvedAt ? new Date(hist.resolvedAt).toLocaleString() : 'Not resolved',
                resolvedAtRaw: hist.resolvedAt ? new Date(hist.resolvedAt) : null,
                acknowledgedBy: hist.resolvedBy?.username || 'Pending',
                branch: hist.branch?.name || undefined,
            }));
            setAlertHistory(formattedHistory);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load alerts and rules. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    // Filter alert history based on selected filters
    const getFilteredHistory = () => {
        return alertHistory.filter(item => {
            // Severity filter
            const matchesSeverity = historyFilter.severity === 'all' || item.severity === historyFilter.severity;

            // Date range filter - use triggeredAtRaw for accurate date comparison
            const dateToCheck = item.resolvedAtRaw || item.triggeredAtRaw;
            const today = new Date();
            const daysAgo = {
                'last7days': 7,
                'last30days': 30,
                'last90days': 90
            }[historyFilter.dateRange] || 90;

            const cutoffDate = new Date();
            cutoffDate.setDate(today.getDate() - daysAgo);
            cutoffDate.setHours(0, 0, 0, 0); // Start of day
            const matchesDateRange = dateToCheck >= cutoffDate;

            return matchesSeverity && matchesDateRange;
        });
    };

    const filteredHistory = getFilteredHistory();

    const handleSaveRule = async () => {
        if (!newRule.threshold) {
            toast.error('Please enter a threshold value');
            return;
        }
        try {
            const ruleData = {
                kpiName: newRule.kpiName,
                threshold: Number(newRule.threshold),
                operator: newRule.operator,
                alertType: newRule.alertType,
                evaluationPeriod: newRule.evaluationPeriod,
                enabled: true,
            };
            console.log('Sending rule data:', ruleData);
            await createAlertRule(ruleData);
            setNewRule({ kpiName: 'Productivity', threshold: '', operator: 'less_than', alertType: 'warning', evaluationPeriod: 'daily' });
            await loadData(); // Reload data after creating rule
            toast.success('Alert rule created successfully');
        } catch (err) {
            console.error('Error creating alert rule:', err);
            toast.error('Failed to create alert rule. Please try again.');
        }
    };

    const handleDismissAlert = async (alertId: string) => {
        try {
            await dismissAlert(alertId);
            setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
            if (showAlertDetails && selectedAlert?.id === alertId) {
                setShowAlertDetails(false);
                setSelectedAlert(null);
            }
            await loadData(); // Reload data after dismissing alert
            toast.success('Alert dismissed successfully');
        } catch (err) {
            console.error('Error dismissing alert:', err);
            toast.error('Failed to dismiss alert. Please try again.');
        }
    };


    const handleViewAlertDetails = (alert: ActiveAlert) => {
        setSelectedAlert(alert);
        setShowAlertDetails(true);
    };

    const handleToggleRule = async (ruleId: string) => {
        try {
            const rule = alertRules.find(r => r.id === ruleId);
            if (!rule) return;
            await updateAlertRule(ruleId, { enabled: !rule.enabled });
            setAlertRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
            toast.success(`Rule ${rule.enabled ? 'disabled' : 'enabled'} successfully`);
            await loadData(); // Reload data after toggling rule
        } catch (err) {
            console.error('Error toggling rule:', err);
            toast.error('Failed to update alert rule. Please try again.');
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Are you sure you want to delete this alert rule?')) return;
        try {
            await deleteAlertRule(ruleId);
            setAlertRules(prev => prev.filter(rule => rule.id !== ruleId));
            toast.success('Alert rule deleted successfully');
            await loadData(); // Reload data after deleting rule
        } catch (err) {
            console.error('Error deleting rule:', err);
            toast.error('Failed to delete alert rule. Please try again.');
        }
    };


    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = activeAlerts.filter(a => a.severity === 'warning').length;
    const uniqueBranches = new Set(activeAlerts.map(a => a.branch).filter(Boolean)).size;
    const resolvedToday = alertHistory.filter(h => new Date().toDateString() === new Date(h.resolvedAt).toDateString()).length;

    const getSeverityColor = (severity: 'warning' | 'critical') =>
        severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200';

    const getSeverityBadgeColor = (severity: 'warning' | 'critical') =>
        severity === 'critical' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white';

    const getOperatorLabel = (operator: string) => {
        switch (operator) {
            case 'less_than': return 'Less than';
            case 'greater_than': return 'Greater than';
            case 'equals': return 'Equals';
            default: return operator;
        }
    };


    return (
        <div className="min-h-screen bg-slate-50">
            <MainPageHeader title="Alerts & Risk Monitoring" description="Configure thresholds, monitor active alerts, and track exception history across your organization" />

            <div className="px-6 md:px-8 py-6 space-y-6">
                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-slate-600">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p>Loading alerts and rules...</p>
                        </div>
                    </div>
                )}

                {!isLoading && (
                <>
                {/* Alert Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-5 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Total Active Alerts</p>
                                <p className="text-3xl font-bold text-slate-900">{activeAlerts.length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>


                    <Card className="p-5 border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Critical Alerts</p>
                                <p className="text-3xl font-bold text-slate-900">{criticalAlerts}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </Card>


                    <Card className="p-5 border-l-4 border-l-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Warning Alerts</p>
                                <p className="text-3xl font-bold text-slate-900">{warningAlerts}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </Card>


                    <Card className="p-5 border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Resolved Today</p>
                                <p className="text-3xl font-bold text-slate-900">{resolvedToday}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Branches with Alerts</p>
                                <p className="text-3xl font-bold text-slate-900">{uniqueBranches}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>


                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Active Alert Rules</p>
                                <p className="text-3xl font-bold text-slate-900">{alertRules.filter(r => r.enabled).length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Settings className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </Card>
                </div>


                {/* Alerts Configuration Panel */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-slate-700" />
                            <h2 className="text-lg font-semibold text-slate-900">Alert Rule Configuration</h2>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowRuleManager(true)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Manage Rules
                        </Button>
                    </div>
                    <p className="text-sm text-slate-600 mb-6">
                        Configure KPI thresholds that trigger automated alerts when performance deviates from expected levels.
                    </p>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm text-slate-700 mb-2 block">KPI Metric</Label>
                            <Select value={newRule.kpiName} onValueChange={(value) => setNewRule({ ...newRule, kpiName: value })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Productivity">Productivity</SelectItem>
                                    <SelectItem value="Growth Rate">Growth Rate</SelectItem>
                                    <SelectItem value="Employee Joins">Employee Joins</SelectItem>
                                    <SelectItem value="Employee Resignations">Employee Resignations</SelectItem>
                                    <SelectItem value="On-Time Delivery">On-Time Delivery</SelectItem>
                                    <SelectItem value="Late Tasks">Late Tasks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div>
                            <Label className="text-sm text-slate-700 mb-2 block">Condition</Label>
                            <Select value={newRule.operator} onValueChange={(value: any) => setNewRule({ ...newRule, operator: value })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="less_than">Less than</SelectItem>
                                    <SelectItem value="greater_than">Greater than</SelectItem>
                                    <SelectItem value="equals">Equals</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div>
                            <Label className="text-sm text-slate-700 mb-2 block">Threshold Value</Label>
                            <Input type="number" placeholder="Enter value" value={newRule.threshold} onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })} />
                        </div>


                        <div>
                            <Label className="text-sm text-slate-700 mb-2 block">Severity Level</Label>
                            <Select value={newRule.alertType} onValueChange={(value: any) => setNewRule({ ...newRule, alertType: value })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div>
                            <Label className="text-sm text-slate-700 mb-2 block">Evaluation Frequency</Label>
                            <Select value={newRule.evaluationPeriod} onValueChange={(value: any) => setNewRule({ ...newRule, evaluationPeriod: value })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="flex items-end">
                            <Button onClick={handleSaveRule} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Save Alert Rule
                            </Button>
                        </div>
                    </div>
                </Card>


                {/* Active Alerts Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Active Alerts</h2>
                        <Badge variant="destructive" className="ml-2">{activeAlerts.length}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-6">
                        Active Alerts represent real-time threshold breaches and require managerial attention.
                    </p>


                    <div className="space-y-3">
                        {activeAlerts.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-slate-600">No active alerts. All KPIs are within acceptable thresholds.</p>
                            </div>
                        ) : (
                            activeAlerts.map((alert) => (
                                <Card key={alert.id} className={`p-5 border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500'} hover:shadow-md transition-shadow`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {alert.severity === 'critical' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
                                                <h3 className="font-semibold text-slate-900">{alert.kpiName}</h3>
                                                <Badge className={getSeverityBadgeColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{alert.description}</p>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500">Current:</span>
                                                    <span className={alert.severity === 'critical' ? 'text-red-600 font-semibold' : 'text-yellow-600 font-semibold'}>{alert.currentValue}%</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500">Threshold:</span>
                                                    <span className="text-slate-900 font-semibold">{alert.threshold}%</span>
                                                </div>
                                                {alert.branch && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-slate-400" />
                                                        <span className="text-slate-600">{alert.branch}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock className="w-4 h-4" />
                                                    {alert.triggeredAt}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleViewAlertDetails(alert)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDismissAlert(alert.id)}>
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </Card>


                {/* Alert History Panel */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-slate-700" />
                            <h2 className="text-lg font-semibold text-slate-900">Alert History</h2>
                            <span className="text-sm text-slate-500">({filteredHistory.length} of {alertHistory.length})</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                value={historyFilter.severity}
                                onValueChange={(value) => setHistoryFilter({ ...historyFilter, severity: value })}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Severity</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                </SelectContent>
                            </Select>


                            <Select
                                value={historyFilter.dateRange}
                                onValueChange={(value) => setHistoryFilter({ ...historyFilter, dateRange: value })}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                                    <SelectItem value="last90days">Last 90 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600">No alerts match your filter criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Alert Type</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Severity</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Branch</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Triggered</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Resolved</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Acknowledged By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4"><span className="text-sm text-slate-900">{item.kpiName}</span></td>
                                            <td className="py-3 px-4"><Badge className={getSeverityBadgeColor(item.severity)}>{item.severity}</Badge></td>
                                            <td className="py-3 px-4"><span className="text-sm text-slate-600">{item.branch}</span></td>
                                            <td className="py-3 px-4"><span className="text-sm text-slate-600">{item.triggeredAt}</span></td>
                                            <td className="py-3 px-4"><span className="text-sm text-slate-600">{item.resolvedAt}</span></td>
                                            <td className="py-3 px-4"><span className="text-sm text-slate-600">{item.acknowledgedBy}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>


                {/* Alert Details Dialog */}
                <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedAlert?.severity === 'critical' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
                                Alert Details
                            </DialogTitle>
                            <DialogDescription>Review the alert information and take appropriate action</DialogDescription>
                        </DialogHeader>


                        {selectedAlert && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg border ${getSeverityColor(selectedAlert.severity)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-slate-900">{selectedAlert.kpiName}</h3>
                                        <Badge className={getSeverityBadgeColor(selectedAlert.severity)}>{selectedAlert.severity.toUpperCase()}</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700">{selectedAlert.description}</p>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Current Value</p>
                                        <p className={`text-2xl font-bold ${selectedAlert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>{selectedAlert.currentValue}%</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Threshold</p>
                                        <p className="text-2xl font-bold text-slate-900">{selectedAlert.threshold}%</p>
                                    </div>
                                </div>


                                {selectedAlert.branch && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Affected Branch</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-600" />
                                            <p className="text-sm text-slate-900">{selectedAlert.branch}</p>
                                        </div>
                                    </div>
                                )}


                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Triggered At</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-600" />
                                        <p className="text-sm text-slate-900">{selectedAlert.triggeredAt}</p>
                                    </div>
                                </div>


                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowAlertDetails(false)}>Close</Button>
                                    <Button variant="default" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => { handleDismissAlert(selectedAlert.id); setShowAlertDetails(false); }}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Dismiss Alert
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>


                {/* Rule Manager Dialog */}
                <Dialog open={showRuleManager} onOpenChange={setShowRuleManager}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-slate-700" />
                                Manage Alert Rules
                            </DialogTitle>
                            <DialogDescription>Enable, disable, or delete existing alert rules</DialogDescription>
                        </DialogHeader>


                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {alertRules.map((rule) => (
                                <Card key={rule.id} className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-slate-900">{rule.kpiName}</h4>
                                                <Badge className={getSeverityBadgeColor(rule.alertType)}>{rule.alertType}</Badge>
                                                {rule.enabled ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge className="bg-slate-100 text-slate-600">Disabled</Badge>}
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                Alert when {getOperatorLabel(rule.operator)} {rule.threshold}% • Evaluated {rule.evaluationPeriod}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                                            <Button variant="outline" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>


                        <div className="flex justify-end pt-4 border-t">
                            <Button onClick={() => setShowRuleManager(false)}>Done</Button>
                        </div>
                    </DialogContent>
                </Dialog>
                </>
                )}
            </div>
        </div>
    );
}
