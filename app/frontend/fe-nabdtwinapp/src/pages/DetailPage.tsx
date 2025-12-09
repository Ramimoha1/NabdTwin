import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card } from '../externaluicomponents/Card.tsx';
import { Button } from '../externaluicomponents/button';
import { Input } from '../externaluicomponents/input';
import { Badge } from '../externaluicomponents/badge';
import { Progress } from '../externaluicomponents/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../externaluicomponents/tabs';
import {
    ArrowLeft,
    Search,
    Users,
    Building2,
    TrendingUp,
    Target,
    Award,
    Briefcase,
    Layers,
    Mail,
    Phone,
    Calendar,
    UserCircle,
    BarChart3,
    FileText,
    Download
} from 'lucide-react';
import { toast } from 'sonner';
import {
    selectSelectedBranchId,
    selectSelectedEmployeeId,
    selectSelectedTeamId,
    selectSelectedDepartmentId,

} from '../store/visual/visualSelector.ts';
import {
    clearSubSelections,
} from '../store/visual/visualSlice.ts';
import {
    setSelectedEmployee,
    setSelectedTeam,
    setSelectedDepartment,
    clearSelection
} from '../store/visual/visualSlice';
import {getBranchByIdKPI} from '../services/API/branches';
import {
    getEmployeesByBranch,
    getTeamsByBranch,
    getDepartmentsByBranch,
    downloadAttendanceReport,
    downloadEmployeeReport,
    type EmployeeDetail,
    type TeamData,
    type DepartmentData
} from '../services/API/detailsApi.ts';

export default function DetailPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get selected IDs from Redux
    const selectedBranchId = useSelector(selectSelectedBranchId);
    const selectedEmployeeId = useSelector(selectSelectedEmployeeId);
    const selectedTeamId = useSelector(selectSelectedTeamId);
    const selectedDepartmentId = useSelector(selectSelectedDepartmentId);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('employees');
    const [branch, setBranch] = useState<any>(null);
    const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [departments, setDepartments] = useState<DepartmentData[]>([]);
    const [loading, setLoading] = useState(true);

    // Derived state for detail views
    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || null;
    const selectedTeam = teams.find(t => t.id === selectedTeamId) || null;
    const selectedDepartment = departments.find(d => d.id === selectedDepartmentId) || null;

    // Load data when component mounts or branchId changes
    useEffect(() => {
        if (!selectedBranchId) {
            navigate('/homepage');
            return;
        }

        loadBranchData();
    }, [selectedBranchId]);

    const loadBranchData = async () => {
        if (!selectedBranchId) return;

        try {
            setLoading(true);

            // FIX: Use selectedBranchId directly (e.g., "1")
            // REMOVED: const branchid = `branch-${selectedEmployeeId}`

            console.log("Fetching details for Branch ID:", selectedBranchId);

            // Load all data in parallel passing the raw ID ("1")
            const [branchData, employeesData, teamsData, departmentsData] = await Promise.all([
                getBranchByIdKPI(selectedBranchId),
                getEmployeesByBranch(selectedBranchId),
                getTeamsByBranch(selectedBranchId),
                getDepartmentsByBranch(selectedBranchId)
            ]);

            setBranch(branchData);
            setEmployees(employeesData);
            setTeams(teamsData);
            setDepartments(departmentsData);
        } catch (error) {
            toast.error('Failed to load branch details');
            console.error('Error loading branch data:', error);
        } finally {
            setLoading(false);
        }
    };
    const onBack = () => {
        dispatch(clearSelection());
        navigate('/homepage');
    };

    const onView3D = () => {
        navigate(`/visualize/${selectedBranchId}`);
    };

    const handleEmployeeClick = (employeeId: string) => {
        dispatch(setSelectedEmployee(employeeId));
    };

    const handleTeamClick = (teamId: string) => {
        dispatch(setSelectedTeam(teamId));
    };

    const handleDepartmentClick = (deptId: string) => {
        dispatch(setSelectedDepartment(deptId));
    };

    const handleBackToList = () => {
        dispatch(clearSubSelections());
    };

    const handleDownloadAttendance = async (employeeId: string) => {
        try {
            const blob = await downloadAttendanceReport(employeeId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-${employeeId}.pdf`;
            a.click();
            toast.success('Attendance report downloaded');
        } catch (error) {
            toast.error('Failed to download attendance report');
        }
    };

    const handleDownloadReport = async (reportId: string) => {
        try {
            const blob = await downloadEmployeeReport(reportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${reportId}.pdf`;
            a.click();
            toast.success('Report downloaded');
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    // Search filtering
    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading branch details...</p>
                </div>
            </div>
        );
    }

    if (!branch) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Branch not found</p>
                    <Button onClick={onBack}>Back to Map</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Map
                    </Button>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl mb-1">{branch.name}</h1>
                        <p className="text-gray-600">{branch.location?.address || branch.address}</p>
                    </div>
                    <Button onClick={onView3D}>
                        <Layers className="h-4 w-4 mr-2" />
                        View 3D Visualization
                    </Button>
                </div>

                {/* Branch KPIs */}
                <div className="grid grid-cols-5 gap-4 mt-6">
                    <Card className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                                <p className="text-xl">${(branch.kpis?.revenue / 1000000 || 0).toFixed(1)}M</p>
                            </div>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <Progress value={(branch.kpis?.growth || 0) * 5} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">+{branch.kpis?.growth || 0}% growth</p>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Employees</p>
                                <p className="text-xl">{employees.length}</p>
                            </div>
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <Progress value={100} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">Active workforce</p>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Satisfaction</p>
                                <p className="text-xl">{branch.kpis?.satisfaction || 0}%</p>
                            </div>
                            <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <Progress value={branch.kpis?.satisfaction || 0} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">Employee satisfaction</p>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Productivity</p>
                                <p className="text-xl">{branch.kpis?.productivity || 0}%</p>
                            </div>
                            <Target className="h-5 w-5 text-orange-600" />
                        </div>
                        <Progress value={branch.kpis?.productivity || 0} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">Overall productivity</p>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Teams</p>
                                <p className="text-xl">{teams.length}</p>
                            </div>
                            <Briefcase className="h-5 w-5 text-teal-600" />
                        </div>
                        <Progress value={(teams.length / 10) * 100} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">Active teams</p>
                    </Card>
                </div>
            </div>

            {/* Search and Tabs */}
            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search employees, teams, or departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="employees">
                            <Users className="h-4 w-4 mr-2" />
                            Employees ({employees.length})
                        </TabsTrigger>
                        <TabsTrigger value="teams">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Teams ({teams.length})
                        </TabsTrigger>
                        <TabsTrigger value="departments">
                            <Building2 className="h-4 w-4 mr-2" />
                            Departments ({departments.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Employees Tab */}
                    <TabsContent value="employees" className="space-y-4">
                        {selectedEmployee ? (
                            <EmployeeDetailView
                                employee={selectedEmployee}
                                onBack={handleBackToList}
                                onDownloadAttendance={handleDownloadAttendance}
                                onDownloadReport={handleDownloadReport}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredEmployees.map((employee) => (
                                    <Card
                                        key={employee.id}
                                        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => handleEmployeeClick(employee.id)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white">
                                                    {employee.firstName[0]}{employee.lastName[0]}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="mb-1">{employee.firstName} {employee.lastName}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{employee.role}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline">{employee.department}</Badge>
                                                    <Badge variant="outline">{employee.team}</Badge>
                                                </div>
                                                <div className="mt-3 space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600">Performance</span>
                                                        <span className="font-medium">{employee.kpis.performanceScore}%</span>
                                                    </div>
                                                    <Progress value={employee.kpis.performanceScore} className="h-1" />
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600">Tasks</span>
                                                        <span className="font-medium">{employee.kpis.tasksCompleted}/{employee.kpis.tasksTotal}</span>
                                                    </div>
                                                    <Progress value={(employee.kpis.tasksCompleted / employee.kpis.tasksTotal) * 100} className="h-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Teams Tab */}
                    <TabsContent value="teams" className="space-y-4">
                        {selectedTeam ? (
                            <TeamDetailView
                                team={selectedTeam}
                                employees={employees}
                                onBack={handleBackToList}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredTeams.map((team) => (
                                    <Card
                                        key={team.id}
                                        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => handleTeamClick(team.id)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="mb-1">{team.name}</h3>
                                                <p className="text-sm text-gray-600">{team.department}</p>
                                            </div>
                                            <Briefcase className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Team Lead</span>
                                                <span>{team.leaderName}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Members</span>
                                                <span>{team.memberCount}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600">Avg Performance</span>
                                                    <span className="font-medium">{team.kpis.avgPerformance}%</span>
                                                </div>
                                                <Progress value={team.kpis.avgPerformance} className="h-1" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Departments Tab */}
                    <TabsContent value="departments" className="space-y-4">
                        {selectedDepartment ? (
                            <DepartmentDetailView
                                department={selectedDepartment}
                                teams={teams}
                                onBack={handleBackToList}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredDepartments.map((dept) => (
                                    <Card
                                        key={dept.id}
                                        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => handleDepartmentClick(dept.id)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="mb-1">{dept.name}</h3>
                                                <p className="text-sm text-gray-600">Head: {dept.headName}</p>
                                            </div>
                                            <Building2 className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Employees</p>
                                                <p className="text-xl">{dept.employeeCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Teams</p>
                                                <p className="text-xl">{dept.teamCount}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function EmployeeDetailView({
                                employee,
                                onBack,
                                onDownloadAttendance,
                                onDownloadReport
                            }: {
    employee: EmployeeDetail;
    onBack: () => void;
    onDownloadAttendance: (id: string) => void;
    onDownloadReport: (id: string) => void;
}) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
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

// Team and Department Detail Views remain similar but simplified for brevity
function TeamDetailView({ team, employees, onBack }: { team: TeamData; employees: EmployeeDetail[]; onBack: () => void }) {
    const teamMembers = employees.filter(e => team.members.includes(e.id));

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
            </Button>
            <Card className="p-6">
                <h2 className="text-2xl mb-4">{team.name}</h2>
                <p className="text-gray-600 mb-4">{team.department} Department</p>
                {/* Add team details here */}
            </Card>
        </div>
    );
}

function DepartmentDetailView({ department, teams, onBack }: { department: DepartmentData; teams: TeamData[]; onBack: () => void }) {
    return (
        <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Departments
            </Button>
            <Card className="p-6">
                <h2 className="text-2xl mb-4">{department.name}</h2>
                <p className="text-gray-600 mb-4">Head: {department.headName}</p>
                {/* Add department details here */}
            </Card>
        </div>
    );
}

