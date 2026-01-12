import { Card } from '../../externaluicomponents/Card';
import { Button } from '../../externaluicomponents/button';
import { Progress } from '../../externaluicomponents/progress';
import { useDetailViewNavigation } from '../../hooks/useDetailViewNavigation';
import {
    ArrowLeft,
    Briefcase
} from 'lucide-react';
import { type EmployeeDetail, type TeamData } from '../../services/API/detailsApi';

interface TeamDetailViewProps {
    team: TeamData;
    employees: EmployeeDetail[];
}

export function TeamDetailView({
    team,
    employees
}: TeamDetailViewProps) {
    const { back } = useDetailViewNavigation();
    console.log('Team Detail View - Team:', team);
    console.log('Team Detail View - Employees:', employees);
    const teamMembers = employees.filter(e => team.members.includes(String(e.id)));
    console.log('Team Members:', teamMembers);

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={back} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
            </Button>

            <Card className="p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl mb-1">{team.name}</h2>
                        <p className="text-gray-600">{team.department} Department</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-gray-400" />
                </div>

                <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Team Lead</p>
                        <p>{team.leaderName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Members</p>
                        <p>{team.memberCount}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Avg Performance</p>
                        <p>{team.kpis.avgPerformance}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Productivity</p>
                        <p>{team.kpis.productivity}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Task Completion</span>
                            <span className="font-medium">{team.kpis.tasksCompleted}/{team.kpis.tasksTotal}</span>
                        </div>
                        <Progress value={(team.kpis.tasksCompleted / team.kpis.tasksTotal) * 100} />
                        <p className="text-xs text-gray-500 mt-1">
                            {Math.round((team.kpis.tasksCompleted / team.kpis.tasksTotal) * 100)}% completed
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Average Performance</span>
                            <span className="font-medium">{team.kpis.avgPerformance}%</span>
                        </div>
                        <Progress value={team.kpis.avgPerformance} />
                        <p className="text-xs text-gray-500 mt-1">Team average</p>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Productivity</span>
                            <span className="font-medium">{team.kpis.productivity}%</span>
                        </div>
                        <Progress value={team.kpis.productivity} />
                        <p className="text-xs text-gray-500 mt-1">Overall productivity</p>
                    </div>
                </div>
            </Card>

            <h3 className="mb-4">Team Members</h3>
            <div className="grid grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                    <Card key={member.id} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm">
                                    {member.firstName[0]}{member.lastName[0]}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium">{member.firstName} {member.lastName}</p>
                                <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-600">Performance</span>
                                    <span>{member.kpis.performanceScore}%</span>
                                </div>
                                <Progress value={member.kpis.performanceScore} className="h-1" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-600">Tasks</span>
                                    <span>{member.kpis.tasksCompleted}/{member.kpis.tasksTotal}</span>
                                </div>
                                <Progress value={(member.kpis.tasksCompleted / member.kpis.tasksTotal) * 100} className="h-1" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
