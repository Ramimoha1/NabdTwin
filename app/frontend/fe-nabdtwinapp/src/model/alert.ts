export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    timestamp: Date;
    branchId?: string;
    read: boolean;
}
