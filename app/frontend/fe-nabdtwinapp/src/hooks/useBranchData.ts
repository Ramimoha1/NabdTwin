import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    getBranchByIdKPI
} from '../services/API/branches';
import { getEmployeesByBranch ,getTeamsByBranch , getDepartmentsByBranch } from '../services/API/detailsApi';
import type { EmployeeDetail } from '../model/employee';
import type { TeamData } from '../model/team';
import type { DepartmentData } from '../model/department';
import type { Branch } from '../model/branch';

export function useBranchData(branchId: string | null) {
    const [branch, setBranch] = useState<Branch | null>(null);
    const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [departments, setDepartments] = useState<DepartmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadBranchData = async () => {
            if (!branchId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log("Fetching details for Branch ID:", branchId);

                const [branchData, employeesData, teamsData, departmentsData] = await Promise.all([
                    getBranchByIdKPI(branchId),
                    getEmployeesByBranch(branchId),
                    getTeamsByBranch(branchId),
                    getDepartmentsByBranch(branchId)
                ]);

                // Enrich teams with inferred members and department if missing
                const teamsWithMembers = teamsData.map(t => {
                    const hasMembers = Array.isArray(t.members) && t.members.length > 0;
                    if (!hasMembers) {
                        const memberIds = employeesData
                            .filter(e => e.team === t.name)
                            .map(e => e.id);
                        const inferredDept = employeesData.find(e => e.team === t.name)?.department;
                        return {
                            ...t,
                            department: t.department || inferredDept || 'Unknown',
                            members: memberIds,
                            memberCount: memberIds.length,
                        };
                    }
                    return t;
                });

                // Enrich departments with inferred head/teamCount when missing
                const departmentsWithCounts = departmentsData.map(d => {
                    const deptEmployees = employeesData.filter(e => e.department === d.name);
                    const deptTeams = teamsWithMembers.filter(t => t.department === d.name);
                    return {
                        ...d,
                        headName: d.headName || deptEmployees[0]?.supervisorName || 'Manager TBD',
                        employeeCount: d.employeeCount || deptEmployees.length,
                        teamCount: d.teamCount || deptTeams.length || 1,
                        kpis: {
                            ...d.kpis,
                            tasksCompleted: d.kpis.tasksCompleted || deptEmployees.reduce((sum, e) => sum + e.kpis.tasksCompleted, 0),
                            tasksTotal: d.kpis.tasksTotal || deptEmployees.reduce((sum, e) => sum + e.kpis.tasksTotal, 0) || 1,
                        }
                    };
                });

                setBranch(branchData);
                setEmployees(employeesData);
                setTeams(teamsWithMembers);
                setDepartments(departmentsWithCounts);
            } catch (err) {
                const error = err as Error;
                setError(error);
                toast.error('Failed to load branch details');
                console.error('Error loading branch data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBranchData();
    }, [branchId]);

    return { branch, employees, teams, departments, loading, error };
}