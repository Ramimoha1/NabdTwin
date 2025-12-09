import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

/**
 * Hook to access user permissions throughout the app
 */
export const usePermissions = () => {
    const { accountType, permissions } = useSelector((state: RootState) => state.auth);
    
    const isAdmin = accountType === 'admin';
    
    return {
        isAdmin,
        canViewReports: permissions?.viewReports ?? isAdmin,
        canViewInsights: permissions?.viewInsights ?? isAdmin,
        canViewEmployees: permissions?.viewEmployees ?? isAdmin,
        viewableBranches: permissions?.viewBranches || [],
        
        /**
         * Check if user can view a specific branch
         */
        canViewBranch: (branchId: string): boolean => {
            if (isAdmin) return true;
            return permissions?.viewBranches?.includes(branchId) ?? false;
        },
        
        /**
         * Filter branches to only those the user can access
         */
        filterBranches: <T extends { id: string }>(branches: T[]): T[] => {
            if (isAdmin) return branches;
            const viewableBranchIds = permissions?.viewBranches || [];
            return branches.filter(branch => viewableBranchIds.includes(branch.id));
        }
    };
};

/**
 * Hook to check if user is authenticated
 */
export const useAuth = () => {
    const { isLoggedIn, username, useremail, accountType, userId } = useSelector((state: RootState) => state.auth);
    
    return {
        isAuthenticated: isLoggedIn,
        user: {
            id: userId,
            username,
            email: useremail,
            accountType
        }
    };
};
