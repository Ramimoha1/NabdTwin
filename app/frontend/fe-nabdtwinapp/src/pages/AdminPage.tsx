import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { selectAccountType, selectIslogin } from "../store/auth/authSelector.ts";
import PageNotAuthorized from "./PageNotAuthorized.tsx";
import { Card } from '../externaluicomponents/Card.tsx';
import { Button } from '../externaluicomponents/button';
import { Input } from '../externaluicomponents/input';
import { Label } from '../externaluicomponents/label';
import { Badge } from '../externaluicomponents/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../externaluicomponents/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../externaluicomponents/select';
import { Checkbox } from '../externaluicomponents/checkbox';
import { UserPlus, Mail, User as UserIcon, Calendar, Clock, Shield, Settings } from 'lucide-react';
import { getBranches } from '../services/API/branches.ts';
import type { Branch } from '../model';
import { toast } from 'sonner';
import {
    getUsers,
    createUser,
    updateUserPermissions,
    toggleUserStatus,
    type UserAccount,
    type CreateUserRequest,
    type UpdatePermissionsRequest
} from '../services/API/userapi.ts';


const AdminPage = () => {
    const accountType = useSelector(selectAccountType);
    const isLoggedIn = useSelector(selectIslogin);

    // State for branches
    const [branches, setBranches] = useState<Branch[]>([]);

    // State for users list
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [loading, setLoading] = useState(true);

    // State for create dialog
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

    // State for permissions dialog
    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
    const [permissionBranches, setPermissionBranches] = useState<string[]>([]);
    const [permissionReports, setPermissionReports] = useState(false);
    const [permissionInsights, setPermissionInsights] = useState(false);
    const [permissionEmployees, setPermissionEmployees] = useState(false);

    // Load users and branches on component mount
    useEffect(() => {
        loadUsers();
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await getBranches();
            setBranches(data);
        } catch (error) {
            toast.error('Failed to load branches');
            console.error('Error loading branches:', error);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleUpdate = async () => {

    }

    const generateRandomPassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        setNewUserPassword(password);
    };

    const handleCreateUser = async () => {
        if (!newUserName.trim() || !newUserEmail.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUserEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            const userData: CreateUserRequest = {
                name: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole
            };

            const newUser = await createUser(userData);
            setUsers([...users, newUser]);

            // Reset form
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('')
            setNewUserRole('user');
            setIsCreateDialogOpen(false);

            toast.success(`Account created for ${newUser.name}`);
        } catch (error) {
            toast.error('Failed to create user');
            console.error('Error creating user:', error);
        }
    };

    const handleOpenPermissions = (user: UserAccount) => {
        setSelectedUser(user);
        setPermissionBranches(user.permissions.viewBranches);
        setPermissionReports(user.permissions.viewReports);
        setPermissionInsights(user.permissions.viewInsights);
        setPermissionEmployees(user.permissions.viewEmployees);
        setIsPermissionsDialogOpen(true);
    };

    const handleSavePermissions = async () => {
        if (!selectedUser) return;

        try {
            const updateData: UpdatePermissionsRequest = {
                userId: selectedUser.id,
                permissions: {
                    viewBranches: permissionBranches,
                    viewReports: permissionReports,
                    viewInsights: permissionInsights,
                    viewEmployees: permissionEmployees
                }
            };

            const updatedUser = await updateUserPermissions(updateData);

            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            setIsPermissionsDialogOpen(false);
            toast.success('Permissions updated successfully');
        } catch (error) {
            toast.error('Failed to update permissions');
            console.error('Error updating permissions:', error);
        }
    };

    const handleToggleUserStatus = async (userId: string) => {
        try {
            const updatedUser = await toggleUserStatus(userId);
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

            const action = updatedUser.status === 'active' ? 'activated' : 'deactivated';
            toast.success(`User ${action} successfully`);
        } catch (error) {
            toast.error('Failed to update user status');
            console.error('Error toggling user status:', error);
        }
    };

    const handleToggleBranch = (branchId: string) => {
        setPermissionBranches(prev =>
            prev.includes(branchId)
                ? prev.filter(id => id !== branchId)
                : [...prev, branchId]
        );
    };

    const handleToggleAllBranches = () => {
        setPermissionBranches(prev => prev.length === 0 ? branches.map(b => b.id) : []);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    };

    if (!accountType || !isLoggedIn) {
        return <PageNotAuthorized />;
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="h-full overflow-auto">
                {/* Header */}
                <div className="p-6 bg-white border-b border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl mb-1">Account Management</h1>
                            <p className="text-gray-600">Create and manage user accounts and permissions</p>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Account</DialogTitle>
                                    <DialogDescription>
                                        Generate a new user account with default permissions
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="userName">Full Name</Label>
                                        <Input
                                            id="userName"
                                            placeholder="Enter full name"
                                            value={newUserName}
                                            onChange={(e) => setNewUserName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="userEmail">Email</Label>
                                        <Input
                                            id="userEmail"
                                            type="email"
                                            placeholder="user@nabdtwin.com"
                                            value={newUserEmail}
                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                        />
                                    </div>
                                
                                    <div className="space-y-2">
                                        <Label htmlFor="userPassword">Password</Label>
                                        <div className='flex gap-2'>
                                        <Input
                                            className='w-3/4'
                                            id="userPassword"
                                            type="text"
                                            placeholder="user@nabdtwin.com"
                                            value={newUserPassword}
                                            onChange={(e) => setNewUserPassword(e.target.value)}
                                        />
                                        <Button  onClick={generateRandomPassword}>
                                            Generate Password
                                        </Button>
                                        </div>
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="userRole">Role</Label>
                                        <Select value={newUserRole} onValueChange={(value: 'admin' | 'user') => setNewUserRole(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">Normal User (CEO/Director)</SelectItem>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleCreateUser} className="w-full">
                                        Create Account
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                                    <p className="text-2xl">{users.length}</p>
                                </div>
                                <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Active</p>
                                    <p className="text-2xl">{users.filter(u => u.status === 'active').length}</p>
                                </div>
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Administrators</p>
                                    <p className="text-2xl">{users.filter(u => u.role === 'admin').length}</p>
                                </div>
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Normal Users</p>
                                    <p className="text-2xl">{users.filter(u => u.role === 'user').length}</p>
                                </div>
                                <UserIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </Card>
                    </div>

                    {/* Users List */}
                    <div>
                        <h2 className="text-xl mb-4">User Accounts</h2>
                        <div className="space-y-3">
                            {users.map((user) => (
                                <Card key={user.id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3>{user.name}</h3>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'admin' ? 'Administrator' : 'User'}
                                                    </Badge>
                                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}
                                                           className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                        {user.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {user.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Joined {formatDate(user.createdAt)}
                                                    </span>
                                                    {user.lastLogin && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Last login {formatDate(user.lastLogin)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-sm">
                                                    <span className="text-gray-600">Permissions:</span>
                                                    {user.permissions.viewBranches.length === 0 ? (
                                                        <Badge variant="outline">All Branches</Badge>
                                                    ) : (
                                                        <Badge variant="outline">{user.permissions.viewBranches.length} Branches</Badge>
                                                    )}
                                                    {user.permissions.viewReports && <Badge variant="outline">Reports</Badge>}
                                                    {user.permissions.viewInsights && <Badge variant="outline">Insights</Badge>}
                                                    {user.permissions.viewEmployees && <Badge variant="outline">Employees</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdate(user)}
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                update
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenPermissions(user)}
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                Permissions
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleUserStatus(user.id)}
                                            >
                                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Permissions Dialog */}
                <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Manage Permissions</DialogTitle>
                            <DialogDescription>
                                Set what {selectedUser?.name} can view and access
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 pt-4">
                            {/* Branch Access */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label>Branch Access</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleToggleAllBranches}
                                    >
                                        {permissionBranches.length === 0 ? 'Select Specific' : 'Allow All'}
                                    </Button>
                                </div>
                                {permissionBranches.length === 0 ? (
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-700">User can view all branches</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 border rounded-lg p-4">
                                        {branches.map((branch: Branch) => (
                                            <div key={branch.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`branch-${branch.id}`}
                                                    checked={permissionBranches.includes(branch.id)}
                                                    onCheckedChange={() => handleToggleBranch(branch.id)}
                                                />
                                                <label
                                                    htmlFor={`branch-${branch.id}`}
                                                    className="text-sm cursor-pointer flex-1"
                                                >
                                                    {branch.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Feature Access */}
                            <div>
                                <Label className="mb-3 block">Feature Access</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm">Reports & Analytics</p>
                                            <p className="text-xs text-gray-500">View and generate reports</p>
                                        </div>
                                        <Checkbox
                                            checked={permissionReports}
                                            onCheckedChange={(checked) => setPermissionReports(checked as boolean)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm">AI Insights</p>
                                            <p className="text-xs text-gray-500">Access AI-driven insights and analytics</p>
                                        </div>
                                        <Checkbox
                                            checked={permissionInsights}
                                            onCheckedChange={(checked) => setPermissionInsights(checked as boolean)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm">Employee Data</p>
                                            <p className="text-xs text-gray-500">View detailed employee information</p>
                                        </div>
                                        <Checkbox
                                            checked={permissionEmployees}
                                            onCheckedChange={(checked) => setPermissionEmployees(checked as boolean)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleSavePermissions} className="flex-1">
                                    Save Permissions
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPermissionsDialogOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AdminPage;