import { Card } from '../../externaluicomponents/Card';
import { Button } from '../../externaluicomponents/button';
import { Badge } from '../../externaluicomponents/badge';
import { Progress } from '../../externaluicomponents/progress';
import { useDetailViewNavigation } from '../../hooks/useDetailViewNavigation';
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Calendar,
    UserCircle,
    Award,
    BarChart3,
    FileText,
    Download
} from 'lucide-react';
import type { EmployeeDetail } from '../../model/employee';
interface EmployeeDetailViewProps {
    employee: EmployeeDetail;
    onDownloadAttendance: (id: string) => void;
    onDownloadReport: (id: string) => void;
}

export function EmployeeDetailView({
    employee,
    onDownloadAttendance,
    onDownloadReport
}: EmployeeDetailViewProps) {
    const { back } = useDetailViewNavigation();
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={back} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
            </Button>

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Personal Info */}
                <div className="col-span-1 space-y-4">
                    <Card className="p-6">
                        <div className="text-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl">
                                    {employee.firstName[0]}{employee.lastName[0]}
                                </span>
                            </div>
                            <h2 className="text-xl mb-1">{employee.firstName} {employee.lastName}</h2>
                            <p className="text-gray-600">{employee.role}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{employee.email}</span>
                            </div>
                            {employee.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-700">{employee.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{employee.department}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{employee.team}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">Joined {formatDate(employee.joinDate)}</span>
                            </div>
                            {employee.supervisorName && (
                                <div className="flex items-center gap-3 text-sm">
                                    <UserCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-700">Reports to {employee.supervisorName}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {employee.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Performance & Reports */}
                <div className="col-span-2 space-y-4">
                    <Card className="p-6">
                        <h3 className="mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Performance KPIs
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Task Completion</span>
                                    <span className="font-medium">
                                        {employee.kpis.tasksCompleted}/{employee.kpis.tasksTotal}
                                    </span>
                                </div>
                                <Progress value={(employee.kpis.tasksCompleted / employee.kpis.tasksTotal) * 100} />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Attendance Rate</span>
                                    <span className="font-medium">{employee.kpis.attendanceRate}%</span>
                                </div>
                                <Progress value={employee.kpis.attendanceRate} />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Performance Score</span>
                                    <span className="font-medium">{employee.kpis.performanceScore}%</span>
                                </div>
                                <Progress value={employee.kpis.performanceScore} />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Productivity</span>
                                    <span className="font-medium">{employee.kpis.productivityScore}%</span>
                                </div>
                                <Progress value={employee.kpis.productivityScore} />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Reports & Documents
                            </h3>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDownloadAttendance(employee.id)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Attendance Report
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {employee.recentReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium">{report.title}</p>
                                            <p className="text-sm text-gray-500">{formatDate(report.date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{report.type}</Badge>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDownloadReport(report.id)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
