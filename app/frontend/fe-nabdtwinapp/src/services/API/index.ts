/**
 * API Services Index
 * Central export point for all API service functions
 */

// Core API client
export { api, default as STRAPI_URL } from './api';

// Branch services
export { getBranches, getBranchById } from './branches';

// Floor services
export { 
    getFloors, 
    getFloorsByBranch, 
    getFloorById 
} from './floors';

// Employee services
export { 
    getEmployees, 
    getEmployeesByBranch, 
    getEmployeesByFloor,
    getEmployeesByWorkspace,
    getEmployeeById 
} from './employees';

// Analytics services
export { 
    getBranchAnalytics, 
    getBranchHistory,
    getFloorAnalytics,
    getFloorHistory,
    getEmployeeAnalytics,
    getEmployeeHistory,
    getDateRange,
    getDefaultDateRange
} from './analytics';

// Export analytics types
export type {
    BranchAnalytics,
    FloorAnalytics,
    EmployeeAnalytics,
    HistoryDataPoint
} from './analytics';

// Stats/Dashboard services
export {
    getDashboardStats,
    getTopBranches,
    getTopEmployees,
    getPerformanceDistribution,
    getKPISummary,
    getOrganizationMetrics
} from './stats';

// User services (existing)
export { 
    getUsers, 
    createUser, 
    updateUserPermissions, 
    toggleUserStatus 
} from './userapi';

export type {
    UserAccount,
    CreateUserRequest,
    UpdatePermissionsRequest
} from './userapi';
