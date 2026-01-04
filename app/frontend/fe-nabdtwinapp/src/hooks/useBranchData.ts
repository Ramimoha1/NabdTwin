import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getBranchDetails } from '../services/API/detailsApi';
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

                // Fetch all data from the single endpoint
                const response = await getBranchDetails(branchId);

                // Transform branch response to match Branch type
                const transformedBranch: Branch = {
                    id: response.branch.id,
                    name: response.branch.name,
                    location: response.branch.location,
                    address: response.branch.location.address,
                    kpis: response.branch.kpis,
                };

                setBranch(transformedBranch);
                setEmployees(response.employees);
                setTeams(response.teams);
                setDepartments(response.departments);
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