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

// Mock data for development
const mockUsers: UserAccount[] = [
    {
        id: 'user-1',
        name: 'Ahmed Mohamed',
        username: 'ahmed.mohamed',
        email: 'ahmed.mohamed@nabdtwin.com',
        role: 'admin',
        status: 'active',
        permissions: {
            viewBranches: [],
            viewReports: true,
            viewInsights: true,
            viewEmployees: true
        },
        createdAt: '2024-01-15T10:30:00Z',
        lastLogin: '2024-12-07T08:45:00Z'
    },
    {
        id: 'user-2',
        name: 'Sarah Hassan',
        username: 'sarah.hassan',
        email: 'sarah.hassan@nabdtwin.com',
        role: 'user',
        status: 'active',
        permissions: {
            viewBranches: ['branch-1', 'branch-2'],
            viewReports: true,
            viewInsights: true,
            viewEmployees: false
        },
        createdAt: '2024-02-20T14:20:00Z',
        lastLogin: '2024-12-06T16:30:00Z'
    },
    {
        id: 'user-3',
        name: 'Omar Khaled',
        username: 'omar.khaled',
        email: 'omar.khaled@nabdtwin.com',
        role: 'user',
        status: 'active',
        permissions: {
            viewBranches: ['branch-3'],
            viewReports: true,
            viewInsights: false,
            viewEmployees: false
        },
        createdAt: '2024-03-10T09:15:00Z',
        lastLogin: '2024-12-05T11:20:00Z'
    },
    {
        id: 'user-4',
        name: 'Fatma Ali',
        username: 'fatma.ali',
        email: 'fatma.ali@nabdtwin.com',
        role: 'user',
        status: 'inactive',
        permissions: {
            viewBranches: [],
            viewReports: false,
            viewInsights: false,
            viewEmployees: false
        },
        createdAt: '2024-04-05T13:45:00Z'
    }
];

// Get all users
export const getUsers = (): Promise<UserAccount[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockUsers]), 300));
    // return api.get("/users").then(res => res.data);
};

// Create new user
export const createUser = (userData: CreateUserRequest): Promise<UserAccount> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser: UserAccount = {
                id: `user-${Date.now()}`,
                name: userData.name,
                username: userData.email.split('@')[0],
                email: userData.email,
                role: userData.role,
                status: 'active',
                permissions: {
                    viewBranches: [],
                    viewReports: userData.role === 'admin',
                    viewInsights: userData.role === 'admin',
                    viewEmployees: userData.role === 'admin'
                },
                createdAt: new Date().toISOString()
            };
            mockUsers.push(newUser);
            resolve(newUser);
        }, 300);
    });
    // return api.post("/users", userData).then(res => res.data);
};

// Update user permissions
export const updateUserPermissions = (data: UpdatePermissionsRequest): Promise<UserAccount> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === data.userId);
            if (userIndex === -1) {
                reject(new Error('User not found'));
                return;
            }
            mockUsers[userIndex].permissions = data.permissions;
            resolve(mockUsers[userIndex]);
        }, 300);
    });
    // return api.patch(`/users/${data.userId}/permissions`, data.permissions).then(res => res.data);
};

// Toggle user status (activate/deactivate)
export const toggleUserStatus = (userId: string): Promise<UserAccount> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                reject(new Error('User not found'));
                return;
            }
            mockUsers[userIndex].status =
                mockUsers[userIndex].status === 'active' ? 'inactive' : 'active';
            resolve(mockUsers[userIndex]);
        }, 300);
    });
    // return api.patch(`/users/${userId}/status`).then(res => res.data);
};

// Delete user
export const deleteUser = (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                reject(new Error('User not found'));
                return;
            }
            mockUsers.splice(userIndex, 1);
            resolve();
        }, 300);
    });
    // return api.delete(`/users/${userId}`).then(res => res.data);
};
