import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  Layers,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { Card } from '../externaluicomponents/Card';
import { Button } from '../externaluicomponents/button';
import { Badge } from '../externaluicomponents/badge';
import { Avatar, AvatarFallback } from '../externaluicomponents/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../externaluicomponents/select';
import { selectSelectedBranchId } from '../store/visual/visualSelector';
import { useBranchData } from '../hooks/useBranchData';
import floor1Url from '../assets/floor1.blueprint3d?url';
import floor2Url from '../assets/floor2.blueprint3d?url';
import floor3Url from '../assets/floor3.blueprint3d?url';
import type { EmployeeDetail } from '../model';
import { getEmployeeById } from '../services/API/detailsApi';
import type { DepartmentData } from '../model/department';
import type { TeamData } from '../model/team';

type BlueprintFloorSource = {
  id: string;
  name: string;
  elevation: number;
  color: string;
  accent: string;
  url: string;
};

const BLUEPRINT_FLOORS: BlueprintFloorSource[] = [
  { id: 'ground', name: 'Ground Floor', elevation: 0, color: '#e0f2fe', accent: '#0ea5e9', url: floor1Url },
  { id: 'level1', name: 'Level 1', elevation: 4, color: '#ecfccb', accent: '#65a30d', url: floor2Url },
  { id: 'level2', name: 'Level 2', elevation: 8, color: '#f3e8ff', accent: '#7c3aed', url: floor3Url },
];

type PanelView =
  | { type: 'empty' }
  | { type: 'summary'; employee: EmployeeDetail }
  | { type: 'detail'; employee: EmployeeDetail }
  | { type: 'department'; department: DepartmentData }
  | { type: 'team'; team: TeamData };

export function VisualizationPage() {
  const navigate = useNavigate();
  const branchId = useSelector(selectSelectedBranchId);
  const { branch, employees, teams, departments, loading } = useBranchData(branchId);

  const [activeFloorId, setActiveFloorId] = useState(BLUEPRINT_FLOORS[0]?.id ?? '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetail | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [panelNav, setPanelNav] = useState<{ history: PanelView[]; current: PanelView }>(
    { history: [], current: { type: 'empty' } }
  );
  const displayFloors = useMemo(() => {
    if (!branch) return BLUEPRINT_FLOORS;
    return BLUEPRINT_FLOORS.map((floor, index) => ({
      ...floor,
      name: branch.totalFloors ? `${branch.name} — Floor ${index + 1}` : floor.name,
    }));
  }, [branch]);

  useEffect(() => {
    setActiveFloorId((current) => (displayFloors.find((f) => f.id === current) ? current : displayFloors[0]?.id ?? ''));
  }, [displayFloors]);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setSelectedEmployee(null);
      return;
    }
    setEmployeeError(null);
    getEmployeeById(selectedEmployeeId)
      .then((emp) => setSelectedEmployee(emp))
      .catch((err) => setEmployeeError(err.message ?? 'Employee not found'));
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (selectedEmployee) {
      setPanelNav({ history: [], current: { type: 'summary', employee: selectedEmployee } });
    } else {
      setPanelNav({ history: [], current: { type: 'empty' } });
    }
  }, [selectedEmployee]);

  const legacySceneUrl = useMemo(() => {
    const target = BLUEPRINT_FLOORS.find((f) => f.id === activeFloorId) ?? BLUEPRINT_FLOORS[0];
    if (!target) return '';
    const sceneParam = encodeURIComponent(target.url);
    // Use same-origin absolute path so postMessage works without sandbox issues
    return `/legacy-viewer/index.html?scene=${sceneParam}&readonly=1`;
  }, [activeFloorId]);

  useEffect(() => {
    function handleLegacyMessage(event: MessageEvent) {
      const data = event.data as { type?: string; employeeId?: string | null };
      if (data?.type === 'bp3d-item-selected') {
        console.log('bp3d message', data);
        setSelectedEmployeeId(data.employeeId ?? null);
      }
    }
    window.addEventListener('message', handleLegacyMessage);
    return () => window.removeEventListener('message', handleLegacyMessage);
  }, []);

  const goToView = (nextView: PanelView, options?: { resetHistory?: boolean }) => {
    setPanelNav((prev) => {
      if (options?.resetHistory) {
        return { history: [], current: nextView };
      }
      const shouldPush = prev.current.type !== 'empty';
      return {
        history: shouldPush ? [...prev.history, prev.current] : prev.history,
        current: nextView,
      };
    });
  };

  const goBack = () => {
    setPanelNav((prev) => {
      if (!prev.history.length) return prev;
      const previous = prev.history[prev.history.length - 1];
      return {
        history: prev.history.slice(0, -1),
        current: previous,
      };
    });
  };

  const resolveDepartment = (name: string): DepartmentData => {
    const existing = departments.find((dept) => dept.name === name);
    if (existing) return existing;
    const deptEmployees = employees.filter((emp) => emp.department === name);
    const deptTeams = teams.filter((team) => team.department === name);
    return {
      id: `dept-${name}`,
      name,
      headName: deptEmployees[0]?.supervisorName ?? 'Manager TBD',
      employeeCount: deptEmployees.length,
      teamCount: deptTeams.length || 1,
      kpis: {
        efficiency: 82,
        satisfaction: 84,
        revenue: 0,
        revenueTarget: 0,
        tasksCompleted: deptEmployees.reduce((sum, emp) => sum + emp.kpis.tasksCompleted, 0),
        tasksTotal: deptEmployees.reduce((sum, emp) => sum + emp.kpis.tasksTotal, 0) || 1,
      },
    };
  };

  const resolveTeam = (name: string): TeamData => {
    const existing = teams.find((team) => team.name === name);
    if (existing) return existing;
    const teamEmployees = employees.filter((emp) => emp.team === name);
    return {
      id: `team-${name}`,
      name,
      branchId: branchId ?? 'unknown',
      department: teamEmployees[0]?.department ?? 'Department',
      leaderName: teamEmployees[0]?.supervisorName ?? 'Lead TBD',
      memberCount: teamEmployees.length,
      members: teamEmployees.map((emp) => emp.id),
      kpis: {
        avgPerformance: teamEmployees.length
          ? Math.round(
              teamEmployees.reduce((sum, emp) => sum + emp.kpis.performanceScore, 0) / teamEmployees.length,
            )
          : 0,
        productivity: teamEmployees.length
          ? Math.round(
              teamEmployees.reduce((sum, emp) => sum + emp.kpis.productivityScore, 0) / teamEmployees.length,
            )
          : 0,
        tasksCompleted: teamEmployees.reduce((sum, emp) => sum + emp.kpis.tasksCompleted, 0),
        tasksTotal: teamEmployees.reduce((sum, emp) => sum + emp.kpis.tasksTotal, 0) || 1,
      },
    };
  };

  const onBack = () => {
    navigate('/branch/' + branchId);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading branch details...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Branch not found</p>
          <Button onClick={onBack}>Back to Map</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <p className="text-sm text-slate-500">{branch.location?.address || 'Branch location'}</p>
              <h1 className="text-xl font-semibold text-slate-900">{branch.name} — 3D Visualization</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>{branch.totalFloors ?? displayFloors.length} Floors</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-500" />
              <span>Orbit, pan, zoom enabled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 lg:flex-row">
        <section className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">
          <div className="pointer-events-none absolute left-4 top-4 z-30">
            <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/70 bg-white/85 px-4 py-3 shadow-xl backdrop-blur">
              <div className="rounded-lg bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white shadow">
                Floors
              </div>
              <div className="w-48">
                <Select value={activeFloorId} onValueChange={setActiveFloorId}>
                  <SelectTrigger className="h-10 justify-between border-none bg-white/0 text-sm font-medium text-slate-900 shadow-none">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent align="start" className="bg-white text-sm shadow-lg">
                    {displayFloors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id} className="cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{floor.name}</span>
                          <span className="text-xs text-slate-500">{floor.elevation} m</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <iframe
            key={legacySceneUrl}
            title="Legacy Blueprint3D"
            src={legacySceneUrl}
            className="h-[720px] w-full border-0"
            allowFullScreen
          />
        </section>

        <aside className="w-full lg:w-[420px]">
          <Card className="space-y-4 p-5 shadow-xl">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-900">Selected Employee</p>
            </div>

            {!selectedEmployeeId && !employeeError && (
              <p className="text-xs text-slate-600">
                Click a marker inside the 3D scene to see employee details. The canvas stays active while you browse.
              </p>
            )}
            {employeeError && <p className="text-xs text-red-600">{employeeError}</p>}

            {panelNav.current.type === 'summary' && (
              <SummaryView
                key={`summary-${panelNav.current.employee.id}`}
                employee={panelNav.current.employee}
                onExpand={() => goToView({ type: 'detail', employee: panelNav.current.employee })}
              />
            )}

            {panelNav.current.type === 'detail' && (
              <DetailView
                key={`detail-${panelNav.current.employee.id}`}
                employee={panelNav.current.employee}
                onBack={goBack}
                onDepartment={() => goToView({ type: 'department', department: resolveDepartment(panelNav.current.employee.department) })}
                onTeam={() => goToView({ type: 'team', team: resolveTeam(panelNav.current.employee.team) })}
              />
            )}

            {panelNav.current.type === 'department' && (
              <DepartmentView
                key={`dept-${panelNav.current.department.id}`}
                department={panelNav.current.department}
                members={employees.filter((emp) => emp.department === panelNav.current.department.name)}
                onBack={goBack}
              />
            )}

            {panelNav.current.type === 'team' && (
              <TeamView
                key={`team-${panelNav.current.team.id}`}
                team={panelNav.current.team}
                members={employees.filter((emp) =>
                  panelNav.current.team.members?.length
                    ? panelNav.current.team.members.includes(emp.id)
                    : emp.team === panelNav.current.team.name,
                )}
                onBack={goBack}
              />
            )}

            {panelNav.current.type === 'empty' && (
              <div className="animate-panel space-y-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Select an employee</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>• Click a marker in the 3D view to highlight an employee.</li>
                  <li>• Use the floating floor selector to change levels without leaving the view.</li>
                  <li>• Details appear here without pausing the 3D canvas.</li>
                </ul>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SummaryView({ employee, onExpand }: { employee: EmployeeDetail; onExpand: () => void }) {
  const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`;
  return (
    <div className="animate-panel space-y-4 rounded-xl bg-slate-50/80 p-4 shadow-inner">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-slate-900/90 text-white">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base font-semibold text-slate-900">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-500">{employee.role}</p>
          <p className="text-xs text-slate-600">{employee.department} · {employee.team}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
        <StatPill label="Performance" value={`${employee.kpis.performanceScore}%`} />
        <StatPill label="Attendance" value={`${employee.kpis.attendanceRate}%`} />
        <StatPill label="Productivity" value={`${employee.kpis.productivityScore}%`} />
      </div>

      <Button onClick={onExpand} className="w-full" variant="secondary" size="sm">
        View full profile
      </Button>
    </div>
  );
}

function DetailView({
  employee,
  onBack,
  onDepartment,
  onTeam,
}: {
  employee: EmployeeDetail;
  onBack: () => void;
  onDepartment: () => void;
  onTeam: () => void;
}) {
  const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`;
  return (
    <div className="animate-panel space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to summary
        </Button>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Profile</Badge>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-slate-900/90 text-white">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-sm text-slate-800">
          <p className="text-base font-semibold text-slate-900">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-500">{employee.role}</p>
          <p className="text-xs text-slate-600">Manager: {employee.supervisorName ?? 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={employee.email} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={employee.phone ?? 'N/A'} />
        <InfoRow icon={<Calendar className="h-4 w-4" />} label="Joined" value={new Date(employee.joinDate).toLocaleDateString()} />
        <InfoRow icon={<Users className="h-4 w-4" />} label="Supervisor" value={employee.supervisorName ?? '—'} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Button variant="outline" className="justify-between" onClick={onDepartment}>
          <span className="text-left">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500">Department</span>
            <span className="text-slate-900">{employee.department}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Button>
        <Button variant="outline" className="justify-between" onClick={onTeam}>
          <span className="text-left">
            <span className="block text-[11px] uppercase tracking-wide text-slate-500">Team</span>
            <span className="text-slate-900">{employee.team}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
        <StatPill label="Performance" value={`${employee.kpis.performanceScore}%`} />
        <StatPill label="Attendance" value={`${employee.kpis.attendanceRate}%`} />
        <StatPill label="Productivity" value={`${employee.kpis.productivityScore}%`} />
      </div>
    </div>
  );
}

function DepartmentView({
  department,
  members,
  onBack,
}: {
  department: DepartmentData;
  members: EmployeeDetail[];
  onBack: () => void;
}) {
  return (
    <div className="animate-panel space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employee Details
        </Button>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Department</Badge>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-900">{department.name}</p>
        <p className="text-sm text-slate-600">Lead: {department.headName}</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
          <StatPill label="Employees" value={department.employeeCount} />
          <StatPill label="Teams" value={department.teamCount} />
          <StatPill
            label="Efficiency"
            value={`${Math.round(
              (department.kpis.tasksCompleted / Math.max(department.kpis.tasksTotal, 1)) * 100,
            )}%`}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <p className="text-sm font-semibold text-slate-900">Members</p>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => (
            <MiniPerson key={member.id} person={member} />
          ))}
          {members.length === 0 && <p className="text-xs text-slate-500">No members listed.</p>}
        </div>
      </div>
    </div>
  );
}

function TeamView({ team, members, onBack }: { team: TeamData; members: EmployeeDetail[]; onBack: () => void }) {
  return (
    <div className="animate-panel space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employee Details
        </Button>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Team</Badge>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-900">{team.name}</p>
        <p className="text-sm text-slate-600">Lead: {team.leaderName}</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
          <StatPill label="Members" value={team.memberCount || members.length} />
          <StatPill
            label="Performance"
            value={`${Math.round((team.kpis.tasksCompleted / Math.max(team.kpis.tasksTotal, 1)) * 100)}%`}
          />
          <StatPill label="Productivity" value={`${team.kpis.productivity}%`} />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <p className="text-sm font-semibold text-slate-900">Members</p>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => (
            <MiniPerson key={member.id} person={member} />
          ))}
          {members.length === 0 && <p className="text-xs text-slate-500">No members listed.</p>}
        </div>
      </div>
    </div>
  );
}

function MiniPerson({ person }: { person: EmployeeDetail }) {
  const initials = `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-slate-900/80 text-white text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="text-xs text-slate-700">
        <p className="font-semibold text-slate-900">{person.firstName} {person.lastName}</p>
        <p className="text-[11px] text-slate-500">{person.role}</p>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-left shadow-sm ring-1 ring-slate-200">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm">
      <span className="text-slate-500">{icon}</span>
      <div className="text-xs">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-slate-900">{value}</p>
      </div>
    </div>
  );
}
