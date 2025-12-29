import { api } from "./api.ts";

export interface UserAccount {
    id: string;
    name: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
    permissions: {
        viewBranches: string[];
        viewReports: boolean;
        viewInsights: boolean;
        viewEmployees: boolean;
    };
    createdAt: string;
    lastLogin?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'user';
}

export interface UpdatePermissionsRequest {
    userId: string;
    permissions: {
        viewBranches: string[];
        viewReports: boolean;
        viewInsights: boolean;
        viewEmployees: boolean;
    };
}

export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword?: string;
    newPasswordConfirmation?: string;
}

/**
 * Normalize Strapi user data to frontend UserAccount format
 */
const normalizeUserData = (rawUser: any): UserAccount => {
    const user = rawUser.attributes || rawUser;
    
    const branchPermissions = user.userBranchPermissions?.data || user.userBranchPermissions || [];
    const viewBranches = branchPermissions.map((bp: any) => 
        (bp.attributes?.branch?.data?.id || bp.branch?.id || bp.branch || '').toString()
    ).filter(Boolean);
    
    const featurePermissions = user.userFeaturePermissions?.data || user.userFeaturePermissions || [];
    const featureNames = featurePermissions.map((fp: any) => 
        fp.attributes?.appFeature?.data?.attributes?.name || fp.appFeature?.name || ''
    );
    
    return {
        id: (rawUser.id || rawUser.documentId || '').toString(),
        name: user.username || user.email?.split('@')[0] || 'Unknown User',
        username: user.username || user.email?.split('@')[0] || '',
        email: user.email || '',
        role: user.type === 'admin' || user.role?.name === 'Admin' ? 'admin' : 'user',
        status: user.blocked ? 'inactive' : 'active',
        permissions: {
            viewBranches: viewBranches,
            viewReports: featureNames.includes('viewReports') || user.type === 'admin',
            viewInsights: featureNames.includes('viewInsights') || user.type === 'admin',
            viewEmployees: featureNames.includes('viewEmployees') || user.type === 'admin'
        },
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin
    };
};

/**
 * Get all users from Strapi
 */
export const getUsers = async (): Promise<UserAccount[]> => {
    try {
        const response = await api.get('/api/users', {
            params: {
                populate: {
                    role: true,
                    userBranchPermissions: {
                        populate: ['branch']
                    },
                    userFeaturePermissions: {
                        populate: ['appFeature']
                    }
                }
            }
        });
        
        console.log('Users API Response:', response.data);
        const users = Array.isArray(response.data) ? response.data : (response.data.data || []);
        return users.map(normalizeUserData);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        
        // If 403, it might be a permissions issue - return empty array for now
        if (error.response?.status === 403) {
            console.warn('Access forbidden - check Strapi permissions for users endpoint');
            return [];
        }
        
        throw error;
    }
};

export const createUser = async (userData: CreateUserRequest): Promise<UserAccount> => {
    try {
        const rolesResponse = await api.get('/api/users-permissions/roles');
        const authenticatedRole = rolesResponse.data.roles?.find((r: any) => r.type === 'authenticated');

        if (!authenticatedRole) {
            throw new Error('Authenticated role not found');
        }

        const response = await api.post('/api/users', {
            username: userData.email,
            email: userData.email,
            password: userData.password,
            role: authenticatedRole.id,
            type: userData.role,
            confirmed: true,
            blocked: false
        });

        console.log('Create user response:', response.data);
        return normalizeUserData(response.data);
    } catch (error: any) {
        console.error('Error creating user:', error);
        console.error('Error response:', error.response?.data);

        if (error.response?.data?.error?.message) {
            throw new Error(error.response.data.error.message);
        }

        throw error;
    }
};

export const updateUserPassword = async (passwordData: ChangePasswordRequest): Promise<any> => {
    try {
        const response = await api.post('/api/auth/change-password', {
            currentPassword: passwordData.currentPassword,
            password: passwordData.newPassword,
            passwordConfirmation: passwordData.newPasswordConfirmation
        }
        );

        return response.data;
    } catch (error: any) {
        // Handle incorrect current password or validation errors
        throw new Error(error.response?.data?.error?.message || 'Failed to update password');
    }
};

export const updateUserPermissions = async (data: UpdatePermissionsRequest): Promise<UserAccount> => {
    try {
        console.log("🔄 Starting Robust Permission Update for User:", data.userId);

        // ---------------------------------------------------------
        // STEP 1: DIRECT CLEANUP (The fix)
        // Instead of guessing IDs from the user object, we ask the Permission Table:
        // "Give me ALL permissions belonging to this user"
        // ---------------------------------------------------------
        
        // A. Fetch existing Branch Permissions for this user
        const branchPermsResponse = await api.get('/api/user-branch-permissions', {
            params: {
                filters: { user: data.userId },
                populate: '*' // Ensure we get the IDs
            }
        });
        
        const branchPermsToDelete = branchPermsResponse.data.data || [];
        console.log(`🗑️ Found ${branchPermsToDelete.length} REAL branch permissions to delete.`);

        // B. Fetch existing Feature Permissions for this user
        const featurePermsResponse = await api.get('/api/user-feature-permissions', {
            params: {
                filters: { user: data.userId },
                populate: '*'
            }
        });
        
        const featurePermsToDelete = featurePermsResponse.data.data || [];

        // ---------------------------------------------------------
        // STEP 2: EXECUTE DELETE
        // ---------------------------------------------------------
        
        await Promise.all(
            branchPermsToDelete.map((perm: any) => {
                // Use documentId or id depending on Strapi version (v5 uses documentId often)
                const idToDelete = perm.documentId || perm.id; 
                console.log(` - Deleting Branch Perm (ID: ${idToDelete})`);
                return api.delete(`/api/user-branch-permissions/${idToDelete}`);
            })
        );

        await Promise.all(
            featurePermsToDelete.map((perm: any) => {
                const idToDelete = perm.documentId || perm.id;
                return api.delete(`/api/user-feature-permissions/${idToDelete}`);
            })
        );

        // ---------------------------------------------------------
        // STEP 3: CREATE NEW PERMISSIONS
        // ---------------------------------------------------------
        console.log(`✨ Creating ${data.permissions.viewBranches.length} new branch permissions...`);
        
        await Promise.all(
            data.permissions.viewBranches.map((branchId: string) =>
                api.post('/api/user-branch-permissions', {
                    data: {
                        user: data.userId,
                        branch: branchId,
                        grantedAt: new Date().toISOString()
                    }
                })
            )
        );

        // ---------------------------------------------------------
        // STEP 4: HANDLE FEATURES (Lookup -> Create)
        // ---------------------------------------------------------
        const featureNames = ['viewReports', 'viewInsights', 'viewEmployees'];
        const featureMap: Record<string, string> = {};

        for (const featureName of featureNames) {
             const featureResponse = await api.get('/api/app-features', {
                params: { filters: { name: { $eq: featureName } } }
            });
            
            let featureId;
            const features = featureResponse.data.data; 
            
            if (features && features.length > 0) {
                featureId = features[0].documentId || features[0].id; // Prefer documentId for v5 relations
            } else {
                const createResponse = await api.post('/api/app-features', {
                    data: { name: featureName, description: `Permission to ${featureName}` }
                });
                featureId = createResponse.data.data.documentId || createResponse.data.data.id;
            }
            featureMap[featureName] = featureId;
        }

        const featurePermissions = [];
        if (data.permissions.viewReports) featurePermissions.push(featureMap.viewReports);
        if (data.permissions.viewInsights) featurePermissions.push(featureMap.viewInsights);
        if (data.permissions.viewEmployees) featurePermissions.push(featureMap.viewEmployees);
        
        await Promise.all(
            featurePermissions.map((featureId: string) =>
                api.post('/api/user-feature-permissions', {
                    data: {
                        user: data.userId,
                        appFeature: featureId,
                        grantedAt: new Date().toISOString()
                    }
                })
            )
        );

        // ---------------------------------------------------------
        // STEP 5: RETURN UPDATED USER
        // ---------------------------------------------------------
        const updatedResponse = await api.get(`/api/users/${data.userId}`, {
            params: {
                populate: {
                    userBranchPermissions: { populate: ['branch'] },
                    userFeaturePermissions: { populate: ['appFeature'] }
                }
            }
        });
        
        return normalizeUserData(updatedResponse.data);

    } catch (error) {
        console.error('Error updating user permissions:', error);
        throw error;
    }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<void> => {
    try {
        await api.delete(`/api/users/${userId}`);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

/**
 * Toggle user status (activate/deactivate)
 */
export const toggleUserStatus = async (userId: string): Promise<UserAccount> => {
    try {
        // First get the current user status
        const userResponse = await api.get(`/api/users/${userId}`);
        // In Strapi Users, 'blocked' = true means inactive/banned
        const currentBlocked = userResponse.data.blocked || false;
        
        // Toggle the blocked status (if blocked is true, set to false, and vice versa)
        const response = await api.put(`/api/users/${userId}`, {
            blocked: !currentBlocked
        });
        
        // Return normalized data so the UI updates instantly
        return normalizeUserData(response.data);
    } catch (error) {
        console.error('Error toggling user status:', error);
        throw error;
    }
};
