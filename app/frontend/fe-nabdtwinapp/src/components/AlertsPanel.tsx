import { useState, useEffect } from 'react';
import { Card } from '../externaluicomponents/Card';
import { Button } from '../externaluicomponents/button';
import { Badge } from '../externaluicomponents/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../externaluicomponents/sheet';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { getActiveAlerts, dismissAlert } from '../services/API/alertsApi';
import { toast } from 'sonner';

interface AlertsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  currentValue: number;
  threshold: number;
  kpiName: string;
  branch?: string;
}

export function AlertsPanel({ open, onOpenChange }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAlerts();
    }
  }, [open]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const activeAlertsData = await getActiveAlerts();
      const formattedAlerts = activeAlertsData.map((alert: any) => ({
        id: alert.id,
        title: alert.title || 'Unknown Alert',
        description: alert.description || '',
        severity: alert.severity as 'critical' | 'warning' | 'info',
        timestamp: new Date(alert.createdAt),
        read: false,
        currentValue: alert.currentValue || 0,
        threshold: alert.threshold || 0,
        kpiName: alert.kpiName || 'Unknown KPI',
        branch: alert.branch?.name,
      }));
      setAlerts(formattedAlerts);
    } catch (err) {
      console.error('Error loading alerts:', err);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          text: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success('Alert dismissed');
    } catch (err) {
      console.error('Error dismissing alert:', err);
      toast.error('Failed to dismiss alert');
    }
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    toast.success('All alerts marked as read');
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl mb-1">Alerts</SheetTitle>
              <SheetDescription className="text-sm text-gray-600">
                {unreadCount} unread notifications
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && alerts.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-50" />
              <p className="text-gray-600">No active alerts</p>
              <p className="text-xs text-gray-500 mt-1">All systems are operating normally</p>
            </div>
          )}

          {!loading && alerts.map((alert) => {
            const Icon = getAlertIcon(alert.severity);
            const colors = getAlertColor(alert.severity);

            return (
              <Card
                key={alert.id}
                className={`p-4 ${!alert.read ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold">{alert.title}</h3>
                      <div className="flex items-center gap-2">
                        {!alert.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="flex-shrink-0 hover:bg-gray-100 p-1 rounded"
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="mb-2 text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Current:</span> {alert.currentValue}% | 
                        <span className="font-medium ml-2">Threshold:</span> {alert.threshold}%
                      </div>
                      {alert.branch && (
                        <div>
                          <span className="font-medium">Branch:</span> {alert.branch}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={colors.badge}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        {!loading && alerts.length > 0 && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Button variant="outline" className="w-full" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
            <Button variant="outline" className="w-full" onClick={loadAlerts}>
              Refresh
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}