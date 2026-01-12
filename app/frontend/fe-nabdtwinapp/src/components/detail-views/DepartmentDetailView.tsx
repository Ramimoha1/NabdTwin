import { Card } from '../../externaluicomponents/Card.tsx';
import { Button } from '../../externaluicomponents/button';
import { Badge } from '../../externaluicomponents/badge';
import { Progress } from '../../externaluicomponents/progress';
import { useDetailViewNavigation } from '../../hooks/useDetailViewNavigation';
import {
    ArrowLeft,
    Building2
} from 'lucide-react';
import { type TeamData, type DepartmentData } from '../../services/API/detailsApi.ts';

interface DepartmentDetailViewProps {
    department: DepartmentData;
    teams: TeamData[];
}

export function DepartmentDetailView({
    department,
    teams
}: DepartmentDetailViewProps) {
    const { back } = useDetailViewNavigation();
    const departmentTeams = teams.filter(t => t.department === department.name);

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={back} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Departments
            </Button>

            <Card className="p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl mb-1">{department.name} Department</h2>
                        <p className="text-gray-600">Head: {department.headName}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-gray-400" />
                </div>

                <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                        <p className="text-2xl">{department.employeeCount}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Teams</p>
                        <p className="text-2xl">{department.teamCount}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Efficiency</p>
                        <p className="text-2xl">{department.kpis.efficiency}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Satisfaction</p>
                        <p className="text-2xl">{department.kpis.satisfaction}%</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {department.kpis.revenueTarget > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Revenue Target</span>
                                <span className="font-medium">
                                    ${(department.kpis.revenue / 1000).toFixed(0)}K / ${(department.kpis.revenueTarget / 1000).toFixed(0)}K
                                </span>
                            </div>
                            <Progress value={(department.kpis.revenue / department.kpis.revenueTarget) * 100} />
                            <p className="text-xs text-gray-500 mt-1">
                                {Math.round((department.kpis.revenue / department.kpis.revenueTarget) * 100)}% of target achieved
                            </p>
                        </div>
                    )}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Task Completion</span>
                            <span className="font-medium">{department.kpis.tasksCompleted}/{department.kpis.tasksTotal}</span>
                        </div>
                        <Progress value={(department.kpis.tasksCompleted / department.kpis.tasksTotal) * 100} />
                        <p className="text-xs text-gray-500 mt-1">
                            {Math.round((department.kpis.tasksCompleted / department.kpis.tasksTotal) * 100)}% completed
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Department Efficiency</span>
                                <span className="font-medium">{department.kpis.efficiency}%</span>
                            </div>
                            <Progress value={department.kpis.efficiency} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Team Satisfaction</span>
                                <span className="font-medium">{department.kpis.satisfaction}%</span>
                            </div>
                            <Progress value={department.kpis.satisfaction} />
                        </div>
                    </div>
                </div>
            </Card>

            <h3 className="mb-4">Department Teams</h3>
            <div className="grid grid-cols-2 gap-4">
                {departmentTeams.map((team) => (
                    <Card key={team.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-medium">{team.name}</h4>
                                <p className="text-sm text-gray-600">Lead: {team.leaderName}</p>
                            </div>
                            <Badge>{team.memberCount} members</Badge>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-600">Performance</span>
                                    <span>{team.kpis.avgPerformance}%</span>
                                </div>
                                <Progress value={team.kpis.avgPerformance} className="h-1" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-600">Tasks</span>
                                    <span>{team.kpis.tasksCompleted}/{team.kpis.tasksTotal}</span>
                                </div>
                                <Progress value={(team.kpis.tasksCompleted / team.kpis.tasksTotal) * 100} className="h-1" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-600">Productivity</span>
                                    <span>{team.kpis.productivity}%</span>
                                </div>
                                <Progress value={team.kpis.productivity} className="h-1" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
