import type { DepartmentData, EmployeeDetail, TeamData } from "../../model";
import { api } from "./api";

// ... [Interfaces remain the same] ...



// const mockEmployees: EmployeeDetail[] = [
//     {
//         id: 'emp-1',
//         firstName: 'Ahmed',
//         lastName: 'Hassan',
//         email: 'ahmed.hassan@company.com',
//         phone: '+966 50 123 4567',
//         role: 'Senior Developer',
//         department: 'Engineering',
//         team: 'Backend Team',
//         branchId: '1', // CHANGED from 'branch-1' to '1'
//         floorId: 'ground',
//         joinDate: '2023-01-15',
//         supervisorName: 'Sara Mohamed',
//         skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
//         kpis: {
//             tasksCompleted: 45,
//             tasksTotal: 50,
//             attendanceRate: 96,
//             performanceScore: 92,
//             productivityScore: 88
//         },
//         recentReports: [
//             { id: 'rep-1', title: 'Q4 Performance Review', date: '2024-12-01', type: 'Performance' },
//             { id: 'rep-2', title: 'Project Completion Report', date: '2024-11-15', type: 'Project' }
//         ]
//     },
//     {
//         id: 'emp-2',
//         firstName: 'Fatima',
//         lastName: 'Ali',
//         email: 'fatima.ali@company.com',
//         phone: '+966 50 999 8888',
//         role: 'UI/UX Designer',
//         department: 'Design',
//         team: 'Creative Team',
//         branchId: '1', // CHANGED from 'branch-1' to '1'
//         floorId: 'ground',
//         joinDate: '2023-03-10',
//         supervisorName: 'Omar Khalid',
//         skills: ['Figma', 'Adobe XD', 'Prototyping'],
//         kpis: {
//             tasksCompleted: 30,
//             tasksTotal: 30,
//             attendanceRate: 98,
//             performanceScore: 95,
//             productivityScore: 91
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-3',
//         firstName: 'Omar',
//         lastName: 'Saleh',
//         email: 'omar.saleh@company.com',
//         phone: '+966 50 777 1111',
//         role: 'Product Manager',
//         department: 'Product',
//         team: 'Platform',
//         branchId: '1',
//         joinDate: '2022-07-01',
//         supervisorName: 'Laila Ahmed',
//         skills: ['Roadmapping', 'User Research', 'Agile'],
//         kpis: {
//             tasksCompleted: 52,
//             tasksTotal: 60,
//             attendanceRate: 97,
//             performanceScore: 89,
//             productivityScore: 86
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-4',
//         firstName: 'Maha',
//         lastName: 'Khalil',
//         email: 'maha.khalil@company.com',
//         phone: '+966 50 222 3333',
//         role: 'QA Engineer',
//         department: 'Engineering',
//         team: 'QA',
//         branchId: '1',
//         floorId: 'ground',
//         joinDate: '2021-11-18',
//         supervisorName: 'Sara Mohamed',
//         skills: ['Automation', 'Cypress', 'Playwright'],
//         kpis: {
//             tasksCompleted: 70,
//             tasksTotal: 80,
//             attendanceRate: 95,
//             performanceScore: 90,
//             productivityScore: 87
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-5',
//         firstName: 'Yousef',
//         lastName: 'Al Rashid',
//         email: 'yousef.rashid@company.com',
//         phone: '+966 50 444 5555',
//         role: 'Data Engineer',
//         department: 'Data',
//         team: 'Pipelines',
//         branchId: '1',
//         floorId: 'level1',
//         joinDate: '2023-04-09',
//         supervisorName: 'Omar Khalid',
//         skills: ['Spark', 'Airflow', 'Python'],
//         kpis: {
//             tasksCompleted: 40,
//             tasksTotal: 48,
//             attendanceRate: 96,
//             performanceScore: 88,
//             productivityScore: 84
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-6',
//         firstName: 'Dana',
//         lastName: 'Fahd',
//         email: 'dana.fahd@company.com',
//         phone: '+966 50 666 7777',
//         role: 'Frontend Engineer',
//         department: 'Engineering',
//         team: 'Web',
//         branchId: '1',
//         floorId: 'level1',
//         joinDate: '2022-02-14',
//         supervisorName: 'Fatima Ali',
//         skills: ['React', 'TypeScript', 'Vite'],
//         kpis: {
//             tasksCompleted: 55,
//             tasksTotal: 65,
//             attendanceRate: 94,
//             performanceScore: 91,
//             productivityScore: 89
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-7',
//         firstName: 'Hussain',
//         lastName: 'Naser',
//         email: 'hussain.naser@company.com',
//         phone: '+966 50 123 7777',
//         role: 'Security Analyst',
//         department: 'Security',
//         team: 'Blue Team',
//         branchId: '1',
//         floorId: 'level1',
//         joinDate: '2020-06-01',
//         supervisorName: 'Laila Ahmed',
//         skills: ['SIEM', 'Threat Hunting', 'Azure'],
//         kpis: {
//             tasksCompleted: 38,
//             tasksTotal: 42,
//             attendanceRate: 98,
//             performanceScore: 93,
//             productivityScore: 90
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-8',
//         firstName: 'Rania',
//         lastName: 'Samir',
//         email: 'rania.samir@company.com',
//         phone: '+966 50 888 9999',
//         role: 'Scrum Master',
//         department: 'Product',
//         team: 'Delivery',
//         branchId: '1',
//         floorId: 'level1',
//         joinDate: '2021-09-21',
//         supervisorName: 'Omar Khalid',
//         skills: ['Scrum', 'Kanban', 'Facilitation'],
//         kpis: {
//             tasksCompleted: 62,
//             tasksTotal: 70,
//             attendanceRate: 97,
//             performanceScore: 90,
//             productivityScore: 88
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-9',
//         firstName: 'Ziad',
//         lastName: 'Mansour',
//         email: 'ziad.mansour@company.com',
//         phone: '+966 50 321 1111',
//         role: 'ML Engineer',
//         department: 'Data',
//         team: 'Models',
//         branchId: '1',
//         floorId: 'level2',
//         joinDate: '2023-05-18',
//         supervisorName: 'Omar Khalid',
//         skills: ['PyTorch', 'MLOps', 'Python'],
//         kpis: {
//             tasksCompleted: 28,
//             tasksTotal: 35,
//             attendanceRate: 96,
//             performanceScore: 87,
//             productivityScore: 85
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-10',
//         firstName: 'Huda',
//         lastName: 'Yasin',
//         email: 'huda.yasin@company.com',
//         phone: '+966 50 654 2222',
//         role: 'Solutions Architect',
//         department: 'Architecture',
//         team: 'Platform',
//         branchId: '1',
//         floorId: 'level2',
//         joinDate: '2019-03-11',
//         supervisorName: 'Laila Ahmed',
//         skills: ['Azure', 'Microservices', 'Networking'],
//         kpis: {
//             tasksCompleted: 80,
//             tasksTotal: 90,
//             attendanceRate: 99,
//             performanceScore: 94,
//             productivityScore: 92
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-11',
//         firstName: 'Tariq',
//         lastName: 'Jaber',
//         email: 'tariq.jaber@company.com',
//         phone: '+966 50 765 4321',
//         role: 'Support Engineer',
//         department: 'Support',
//         team: 'L2 Support',
//         branchId: '1',
//         floorId: 'level2',
//         joinDate: '2024-01-05',
//         supervisorName: 'Sara Mohamed',
//         skills: ['Troubleshooting', 'SLA Management', 'Azure'],
//         kpis: {
//             tasksCompleted: 22,
//             tasksTotal: 25,
//             attendanceRate: 95,
//             performanceScore: 85,
//             productivityScore: 82
//         },
//         recentReports: []
//     },
//     {
//         id: 'emp-12',
//         firstName: 'Rami',
//         lastName: 'Yassein',
//         email: 'rami.yassein@company.com',
//         phone: '+966 50 111 2222',
//         role: 'Chief Executive Officer',
//         department: 'Executive',
//         team: 'Leadership',
//         branchId: '1',
//         floorId: 'ground',
//         joinDate: '2017-05-10',
//         supervisorName: 'Board of Directors',
//         skills: ['Leadership', 'Strategy', 'Fundraising'],
//         kpis: {
//             tasksCompleted: 95,
//             tasksTotal: 100,
//             attendanceRate: 99,
//             performanceScore: 97,
//             productivityScore: 96
//         },
//         recentReports: [
//             { id: 'rep-12a', title: 'Annual Strategy 2025', date: '2024-12-15', type: 'Strategy' },
//             { id: 'rep-12b', title: 'Board Update Q4', date: '2024-12-20', type: 'Executive' }
//         ]
//     }
// ];

// const mockTeams: TeamData[] = [
//     {
//         id: 'team-1',
//         name: 'Backend Team',
//         department: 'Engineering',
//         branchId: '1', // CHANGED
//         leaderName: 'Sara Mohamed',
//         memberCount: 8,
//         members: ['emp-1'],
//         kpis: {
//             avgPerformance: 87,
//             tasksCompleted: 120,
//             tasksTotal: 140,
//             productivity: 85
//         }
//     },
//     {
//         id: 'team-2',
//         name: 'Creative Team',
//         department: 'Design',
//         branchId: '1', // CHANGED
//         leaderName: 'Fatima Ali',
//         memberCount: 4,
//         members: ['emp-2'],
//         kpis: {
//             avgPerformance: 92,
//             tasksCompleted: 40,
//             tasksTotal: 45,
//             productivity: 90
//         }
//     }
// ];

// const mockDepartments: DepartmentData[] = [
//     {
//         id: 'dept-1',
//         name: 'Engineering',
//         branchId: '1', // CHANGED
//         headName: 'Omar Khalid',
//         employeeCount: 45,
//         teamCount: 5,
//         kpis: {
//             revenue: 850000,
//             revenueTarget: 1000000,
//             tasksCompleted: 340,
//             tasksTotal: 400,
//             efficiency: 88,
//             satisfaction: 85
//         }
//     },
//     {
//         id: 'dept-2',
//         name: 'Design',
//         branchId: '1', // CHANGED
//         headName: 'Laila Ahmed',
//         employeeCount: 12,
//         teamCount: 2,
//         kpis: {
//             revenue: 200000,
//             revenueTarget: 250000,
//             tasksCompleted: 100,
//             tasksTotal: 110,
//             efficiency: 95,
//             satisfaction: 92
//         }
//     }
// ];

// --- API FUNCTIONS ---

// Helper to make string/number comparison safer
// This ensures "1" (string) matches 1 (number) or "1" (string)
const isMatch = (id1: string | number, id2: string | number) => {
    return String(id1) === String(id2);
};

// Get employees by branch
export const getEmployeesByBranch = (branchId: string): Promise<EmployeeDetail[]> => {
    // Try real backend first
    return api
        .get(`api/employees/by-branch/${branchId}`)
        .then(response => {
            console.log('✅ Loaded employees from backend');
            return Array.isArray(response.data) ? response.data : [response.data];
        })
        .catch(error => {
            console.warn('⚠️ Backend unavailable, using mock data:', error.message);
            // Fallback to mock data for development
            return new Promise(resolve => {
                setTimeout(() => {
                    const filtered = mockEmployees.filter(e => isMatch(e.branchId, branchId));
                    console.log(`📦 Loaded ${filtered.length} mock employees`);
                    resolve(filtered);
                }, 300);
            });
        });
};

// Get single employee
export const getEmployeeById = (employeeId: string): Promise<EmployeeDetail> => {
    // Try real backend first
    return api
        .get(`api/employees/details/${employeeId}`)
        .then(response => {
            console.log(`✅ Loaded employee ${employeeId} from backend`);
            return response.data;
        })
        .catch(error => {
            console.warn(`⚠️ Backend unavailable for ${employeeId}, using mock data:`, error.message);
            // Fallback to mock data for development
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const employee = mockEmployees.find(e => e.id === employeeId);
                    if (employee) {
                        console.log(`📦 Loaded mock employee ${employeeId}`);
                        resolve(employee);
                    }
                    else reject(new Error('Employee not found'));
                }, 300);
            });
        });
};

// Get teams by branch
export const getTeamsByBranch = (branchId: string): Promise<TeamData[]> => {
    return api
        .get('api/teams', {
            params: {
                populate: '*',
                'filters[branch][id][$eq]': branchId,
            },
        })
        .then(response => {
            const teams = response.data?.data || [];
            console.log(`✅ Loaded ${teams.length} teams from backend`);
            return teams.map((t: any) => {
                // Handle both nested (data/attributes) and flat responses from populate=*
                const attrs = t?.attributes ?? t;
                const employees = Array.isArray(attrs?.employees) ? attrs.employees : (attrs?.employees?.data ?? []);
                
                let tasksCompleted = 0;
                let tasksTotal = 0;
                let performanceSum = 0;
                let memberCount = 0;

                for (const emp of employees) {
                    const eAttrs = emp?.attributes ?? emp;
                    const kpis = Array.isArray(eAttrs?.employeeKpis) ? eAttrs.employeeKpis : (eAttrs?.employeeKpis?.data ?? []);
                    // select KPI with latest createdAt
                    let latest: any = undefined;
                    for (const k of kpis) {
                        const ka = k?.attributes ?? k;
                        if (!latest) latest = ka;
                        else if (ka?.createdAt && latest?.createdAt) {
                            if (new Date(ka.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
                                latest = ka;
                            }
                        }
                    }
                    if (latest) {
                        tasksCompleted += latest.tasksCompleted ?? 0;
                        tasksTotal += latest.tasksTotal ?? 0;
                        performanceSum += latest.performanceScore ?? 0;
                        memberCount++;
                    }
                }

                const avgPerformance = memberCount > 0 ? Math.round(performanceSum / memberCount) : 85;
                const productivity = memberCount > 0 && tasksTotal > 0 
                    ? Math.round((tasksCompleted / tasksTotal) * 100) 
                    : 82;

                // Extract department name from nested or flat response
                const deptName = attrs?.department?.name || attrs?.department?.data?.attributes?.name || 'Unknown';
                const branchIdVal = attrs?.branch?.id || attrs?.branch?.data?.id || branchId;
                
                // Extract leader name
                const leader = attrs?.leaderEmployee?.data?.attributes ?? attrs?.leaderEmployee;
                const leaderName = leader?.firstName 
                    ? `${leader.firstName} ${leader.lastName || ''}`.trim() 
                    : 'Team Lead TBD';

                return {
                    id: String(t.id),
                    name: attrs?.name,
                    department: deptName,
                    branchId: String(branchIdVal),
                    leaderName: leaderName,
                    memberCount: employees.length,
                    members: employees.map((e: any) => String(e.id)),
                    kpis: { 
                        avgPerformance: avgPerformance, 
                        productivity: productivity, 
                        tasksCompleted: tasksCompleted, 
                        tasksTotal: tasksTotal || 1 
                    },
                };
            });
        })
        .catch(error => {
            console.warn('⚠️ Backend unavailable, using mock teams:', error.message);
            return mockTeams.filter(t => isMatch(t.branchId, branchId));
        });
};

// Get departments by branch
export const getDepartmentsByBranch = (branchId: string): Promise<DepartmentData[]> => {
    return api
        .get('api/departments', {
            params: {
                populate: '*',
                'filters[branch][id][$eq]': branchId,
            },
        })
        .then(response => {
            const depts = response.data?.data || [];
            console.log(`✅ Loaded ${depts.length} departments from backend`);
            return depts.map((d: any) => {
                // Handle both nested (data/attributes) and flat responses from populate=*
                const attrs = d?.attributes ?? d;
                const employees = Array.isArray(attrs?.employees) ? attrs.employees : (attrs?.employees?.data ?? []);
                
                let tasksCompleted = 0;
                let tasksTotal = 0;
                let performanceSum = 0;
                let employeeCount = 0;

                for (const emp of employees) {
                    const eAttrs = emp?.attributes ?? emp;
                    const kpis = Array.isArray(eAttrs?.employeeKpis) ? eAttrs.employeeKpis : (eAttrs?.employeeKpis?.data ?? []);
                    // select KPI with latest createdAt
                    let latest: any = undefined;
                    for (const k of kpis) {
                        const ka = k?.attributes ?? k;
                        if (!latest) latest = ka;
                        else if (ka?.createdAt && latest?.createdAt) {
                            if (new Date(ka.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
                                latest = ka;
                            }
                        }
                    }
                    if (latest) {
                        tasksCompleted += latest.tasksCompleted ?? 0;
                        tasksTotal += latest.tasksTotal ?? 0;
                        performanceSum += latest.performanceScore ?? 0;
                        employeeCount++;
                    }
                }

                const avgPerformance = employeeCount > 0 ? Math.round(performanceSum / employeeCount) : 88;

                // Extract head employee name from nested or flat response
                const head = attrs?.headEmployee?.data?.attributes ?? attrs?.headEmployee;
                const headName = head?.firstName 
                    ? `${head.firstName} ${head.lastName || ''}`.trim() 
                    : 'Manager TBD';
                
                const branchIdVal = attrs?.branch?.id || attrs?.branch?.data?.id || branchId;

                return {
                    id: String(d.id),
                    name: attrs?.name,
                    headName: headName,
                    branchId: String(branchIdVal),
                    employeeCount: employees.length,
                    teamCount: 1,
                    kpis: {
                        efficiency: avgPerformance,
                        satisfaction: 86,
                        revenue: 0,
                        revenueTarget: 0,
                        tasksCompleted: tasksCompleted,
                        tasksTotal: tasksTotal || 1,
                    },
                };
            });
        })
        .catch(error => {
            console.warn('⚠️ Backend unavailable, using mock departments:', error.message);
            return mockDepartments.filter(d => isMatch(d.branchId, branchId));
        });
};

// Download attendance report
export const downloadAttendanceReport = (employeeId: string): Promise<Blob> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const blob = new Blob(['Attendance report data'], { type: 'application/pdf' });
            resolve(blob);
        }, 500);
    });
};

// Download employee report
export const downloadEmployeeReport = (reportId: string): Promise<Blob> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const blob = new Blob(['Report data'], { type: 'application/pdf' });
            resolve(blob);
        }, 500);
    });
};