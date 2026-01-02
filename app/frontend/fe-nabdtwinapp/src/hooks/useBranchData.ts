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

                setBranch(branchData);
                setEmployees(employeesData);
                setTeams(teamsData);
                setDepartments(departmentsData);
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