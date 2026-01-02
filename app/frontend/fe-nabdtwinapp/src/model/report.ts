export interface Report {
    id: string;
    title: string;
    type: 'branch' | 'floor' | 'employee' | 'kpi';
    generatedAt: Date;
    generatedBy: string;
    data: any;
}
