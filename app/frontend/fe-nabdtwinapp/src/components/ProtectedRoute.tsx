import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions, useAuth } from '../hooks/usePermissions';
import { Card } from '../externaluicomponents/Card';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requirePermission?: 'viewReports' | 'viewInsights' | 'viewEmployees' | 'admin';
}

/**
 * ProtectedRoute component that checks user permissions before rendering
 * Redirects to homepage if user doesn't have required permission
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requirePermission 
}) => {
    const { isAuthenticated } = useAuth();
    const { canViewReports, canViewInsights, canViewEmployees, isAdmin } = usePermissions();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check specific permissions
    if (requirePermission) {
        let hasPermission = false;

        switch (requirePermission) {
            case 'admin':
                hasPermission = isAdmin;
                break;
            case 'viewReports':
                hasPermission = canViewReports;
                break;
            case 'viewInsights':
                hasPermission = canViewInsights;
                break;
            case 'viewEmployees':
                hasPermission = canViewEmployees;
                break;
            default:
                hasPermission = false;
        }

        // If user doesn't have permission, show access denied
        if (!hasPermission) {
            return (
                <div className="flex items-center justify-center h-full p-6">
                    <Card className="max-w-md p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-4">
                            You don't have permission to access this page.
                        </p>
                        <p className="text-sm text-gray-500">
                            Please contact your administrator if you believe this is an error.
                        </p>
                    </Card>
                </div>
            );
        }
    }

    return <>{children}</>;
};
