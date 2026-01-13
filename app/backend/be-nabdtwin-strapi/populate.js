
const API_URL = 'http://localhost:3001/api'; 
/**
 * UNIFIED DATABASE POPULATION SCRIPT
 * Creates all necessary data: organization, branches, departments, teams, employees, skills, and KPIs
 * This is the ONLY script you need to run for complete database setup
 */
async function seed() {
    console.log("🚀 Starting Unified Data Population...\n");

    const post = async (endpoint, data) => {
        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        return res.json();
    };

    const put = async (endpoint, id, data) => {
        const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        return res.json();
    };


    // ===== ORGANIZATION & STRUCTURE =====
    console.log("🏢 Creating Organization...");
    const orgRes = await post('organizations', { name: "TechCorp Saudi", industry: "Technology" });
    const orgId = orgRes.data?.id;

    console.log("📍 Creating Branches...");
    const branches = [
        { name: "Riyadh HQ", city: "Riyadh", lat: 24.7136, lng: 46.6753, target: 5000000 },
        { name: "Jeddah Hub", city: "Jeddah", lat: 21.5433, lng: 39.1728, target: 3000000 },
        { name: "Dammam Port", city: "Dammam", lat: 26.4207, lng: 50.0888, target: 2000000 }
    ];

    const branchIds = [];
    for (const b of branches) {
        const res = await post('branches', {
            name: b.name,
            address: `${b.city} Main District`,
            city: b.city,
            country: "Saudi Arabia",
            latitude: b.lat,
            longitude: b.lng,
            branchStatus: "active",
            revenueTarget: b.target,
            organization: orgId
        });
        if(res.data) branchIds.push({ id: res.data.id, name: b.name, target: b.target });
    }

    console.log("🏢 Creating Floors and Workspaces...");
    const floorIds = [];
    for (const b of branchIds) {
        for (let f = 1; f <= 2; f++) {
            const floorRes = await post('floors', {
                name: f === 1 ? 'ground' : `level${f - 1}`,
                floorNumber: f,
                branch: b.id
            });
            
            if (floorRes.data) {
                floorIds.push({ id: floorRes.data.id, name: f === 1 ? 'ground' : `level${f - 1}`, branchId: b.id });
                
                for (let w = 1; w <= 3; w++) {
                    await post('workspaces', {
                        name: `Workspace ${f}-${w}`,
                        capacity: 5,
                        floor: floorRes.data.id
                    });
                }
            }
        }
    }

    // ===== DEPARTMENTS, TEAMS, SKILLS =====
    console.log("🏛️ Creating Departments...");
    const departmentData = [
        { name: "Engineering" },
        { name: "Design" },
        { name: "Product" },
        { name: "Data" },
        { name: "Architecture" },
        { name: "Security" },
        { name: "Support" },
        { name: "Executive" }
    ];
    
    const departmentIdsByBranch = {};
    for (const b of branchIds) {
        departmentIdsByBranch[b.id] = [];
        for (const dept of departmentData) {
            const res = await post('departments', {
                name: dept.name,
                branch: b.id,
                organization: orgId
            });
            if (res.data) departmentIdsByBranch[b.id].push({ id: res.data.id, name: dept.name });
        }
    }

    console.log("👥 Creating Teams...");
    const teamData = [
        { name: "Backend Team", department: "Engineering" },
        { name: "Creative Team", department: "Design" },
        { name: "Platform", department: "Product" },
        { name: "Pipelines", department: "Data" },
        { name: "Web", department: "Engineering" },
        { name: "Blue Team", department: "Security" },
        { name: "Delivery", department: "Product" },
        { name: "Models", department: "Data" },
        { name: "QA", department: "Engineering" },
        { name: "L2 Support", department: "Support" },
        { name: "Leadership", department: "Executive" }
    ];
    
    const teamIdsByBranch = {};
    for (const b of branchIds) {
        teamIdsByBranch[b.id] = [];
        const depts = departmentIdsByBranch[b.id];
        // Vary team composition per branch to avoid identical structures
        let teamsForBranch = teamData;
        if (b.name.includes('Jeddah')) {
            teamsForBranch = teamData.filter(t => !['Models', 'Leadership'].includes(t.name));
        } else if (b.name.includes('Dammam')) {
            teamsForBranch = teamData.filter(t => ['Backend Team', 'Creative Team', 'Platform', 'QA', 'Web', 'Blue Team'].includes(t.name));
        }
        for (const team of teamsForBranch) {
            const dept = depts.find(d => d.name === team.department) || depts[0];
            const res = await post('teams', {
                name: team.name,
                department: dept.id,
                branch: b.id
            });
            if (res.data) teamIdsByBranch[b.id].push({ id: res.data.id, name: team.name });
        }
    }

    console.log("🎯 Creating Skills...");
    const skillNames = [
        "React", "Node.js", "TypeScript", "AWS", "Figma", "Adobe XD", "Prototyping",
        "Roadmapping", "User Research", "Agile", "Automation", "Cypress", "Playwright",
        "Spark", "Airflow", "Python", "Vite", "SIEM", "Threat Hunting", "Azure",
        "Scrum", "Kanban", "Facilitation", "PyTorch", "MLOps", "Microservices",
        "Networking", "Troubleshooting", "SLA Management", "Leadership", "Strategy", "Fundraising"
    ];
    
    const skillIds = {};
    for (const skillName of skillNames) {
        const res = await post('skills', {
            name: skillName,
            category: "Technical"
        });
        if(res.data) skillIds[skillName] = res.data.id;
    }


    // ===== EMPLOYEES WITH MOCK DATA MAPPING =====
    console.log("👥 Creating Employees with Full Details...");
    
    const employeeData = [
        {
            firstName: 'Ahmed',
            lastName: 'Hassan',
            email: 'ahmed.hassan@company.com',
            phone: '+966 50 123 4567',
            role: 'Senior Developer',
            department: 'Engineering',
            team: 'Backend Team',
            floorId: 'ground',
            joinDate: '2023-01-15',
            supervisorName: 'Sara Mohamed',
            skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
            kpis: {
                tasksCompleted: 45,
                tasksTotal: 50,
                attendanceRate: 96,
                performanceScore: 92,
                productivityScore: 88
            }
        },
        {
            firstName: 'Fatima',
            lastName: 'Ali',
            email: 'fatima.ali@company.com',
            phone: '+966 50 999 8888',
            role: 'UI/UX Designer',
            department: 'Design',
            team: 'Creative Team',
            floorId: 'ground',
            joinDate: '2023-03-10',
            supervisorName: 'Omar Khalid',
            skills: ['Figma', 'Adobe XD', 'Prototyping'],
            kpis: {
                tasksCompleted: 30,
                tasksTotal: 30,
                attendanceRate: 98,
                performanceScore: 95,
                productivityScore: 91
            }
        },
        {
            firstName: 'Omar',
            lastName: 'Khalid',
            email: 'omar.khalid@company.com',
            phone: '+966 50 777 1111',
            role: 'Engineering Manager',
            department: 'Engineering',
            team: 'Backend Team',
            floorId: 'ground',
            joinDate: '2019-01-01',
            supervisorName: 'Rami Yassein',
            skills: ['Leadership', 'Strategy', 'Microservices'],
            kpis: {
                tasksCompleted: 55,
                tasksTotal: 60,
                attendanceRate: 99,
                performanceScore: 96,
                productivityScore: 94
            }
        },
        {
            firstName: 'Laila',
            lastName: 'Ahmed',
            email: 'laila.ahmed@company.com',
            phone: '+966 50 222 3333',
            role: 'Product Director',
            department: 'Product',
            team: 'Platform',
            floorId: 'level1',
            joinDate: '2018-06-01',
            supervisorName: 'Rami Yassein',
            skills: ['Roadmapping', 'Leadership', 'Agile'],
            kpis: {
                tasksCompleted: 70,
                tasksTotal: 80,
                attendanceRate: 98,
                performanceScore: 95,
                productivityScore: 93
            }
        },
        {
            firstName: 'Sara',
            lastName: 'Mohamed',
            email: 'sara.mohamed@company.com',
            phone: '+966 50 444 5555',
            role: 'QA Lead',
            department: 'Engineering',
            team: 'QA',
            floorId: 'level1',
            joinDate: '2020-03-15',
            supervisorName: 'Omar Khalid',
            skills: ['Automation', 'Cypress', 'Leadership'],
            kpis: {
                tasksCompleted: 40,
                tasksTotal: 48,
                attendanceRate: 96,
                performanceScore: 93,
                productivityScore: 91
            }
        },
        {
            firstName: 'Maha',
            lastName: 'Khalil',
            email: 'maha.khalil@company.com',
            phone: '+966 50 666 7777',
            role: 'QA Engineer',
            department: 'Engineering',
            team: 'QA',
            floorId: 'ground',
            joinDate: '2021-11-18',
            supervisorName: 'Sara Mohamed',
            skills: ['Automation', 'Cypress', 'Playwright'],
            kpis: {
                tasksCompleted: 38,
                tasksTotal: 42,
                attendanceRate: 95,
                performanceScore: 90,
                productivityScore: 87
            }
        },
        {
            firstName: 'Yousef',
            lastName: 'Al Rashid',
            email: 'yousef.rashid@company.com',
            phone: '+966 50 123 7777',
            role: 'Data Engineer',
            department: 'Data',
            team: 'Pipelines',
            floorId: 'level1',
            joinDate: '2023-04-09',
            supervisorName: 'Omar Khalid',
            skills: ['Spark', 'Airflow', 'Python'],
            kpis: {
                tasksCompleted: 40,
                tasksTotal: 48,
                attendanceRate: 96,
                performanceScore: 88,
                productivityScore: 84
            }
        },
        {
            firstName: 'Dana',
            lastName: 'Fahd',
            email: 'dana.fahd@company.com',
            phone: '+966 50 888 9999',
            role: 'Frontend Engineer',
            department: 'Engineering',
            team: 'Web',
            floorId: 'level1',
            joinDate: '2022-02-14',
            supervisorName: 'Sara Mohamed',
            skills: ['React', 'TypeScript', 'Vite'],
            kpis: {
                tasksCompleted: 55,
                tasksTotal: 65,
                attendanceRate: 94,
                performanceScore: 91,
                productivityScore: 89
            }
        },
        {
            firstName: 'Hussain',
            lastName: 'Naser',
            email: 'hussain.naser@company.com',
            phone: '+966 50 321 1111',
            role: 'Security Analyst',
            department: 'Security',
            team: 'Blue Team',
            floorId: 'level1',
            joinDate: '2020-06-01',
            supervisorName: 'Laila Ahmed',
            skills: ['SIEM', 'Threat Hunting', 'Azure'],
            kpis: {
                tasksCompleted: 38,
                tasksTotal: 42,
                attendanceRate: 98,
                performanceScore: 93,
                productivityScore: 90
            }
        },
        {
            firstName: 'Rania',
            lastName: 'Samir',
            email: 'rania.samir@company.com',
            phone: '+966 50 654 2222',
            role: 'Scrum Master',
            department: 'Product',
            team: 'Delivery',
            floorId: 'level2',
            joinDate: '2021-09-21',
            supervisorName: 'Laila Ahmed',
            skills: ['Scrum', 'Kanban', 'Facilitation'],
            kpis: {
                tasksCompleted: 62,
                tasksTotal: 70,
                attendanceRate: 97,
                performanceScore: 90,
                productivityScore: 88
            }
        },
        {
            firstName: 'Ziad',
            lastName: 'Mansour',
            email: 'ziad.mansour@company.com',
            phone: '+966 50 765 4321',
            role: 'ML Engineer',
            department: 'Data',
            team: 'Models',
            floorId: 'level2',
            joinDate: '2023-05-18',
            supervisorName: 'Omar Khalid',
            skills: ['PyTorch', 'MLOps', 'Python'],
            kpis: {
                tasksCompleted: 28,
                tasksTotal: 35,
                attendanceRate: 96,
                performanceScore: 87,
                productivityScore: 85
            }
        },
        {
            firstName: 'Huda',
            lastName: 'Yasin',
            email: 'huda.yasin@company.com',
            phone: '+966 50 111 2222',
            role: 'Solutions Architect',
            department: 'Architecture',
            team: 'Platform',
            floorId: 'level2',
            joinDate: '2019-03-11',
            supervisorName: 'Laila Ahmed',
            skills: ['Azure', 'Microservices', 'Networking'],
            kpis: {
                tasksCompleted: 80,
                tasksTotal: 90,
                attendanceRate: 99,
                performanceScore: 94,
                productivityScore: 92
            }
        },
        {
            firstName: 'Rami',
            lastName: 'Yassein',
            email: 'rami.yassein@company.com',
            phone: '+966 50 222 3333',
            role: 'Chief Executive Officer',
            department: 'Executive',
            team: 'Leadership',
            floorId: 'ground',
            joinDate: '2017-05-10',
            supervisorName: 'Board of Directors',
            skills: ['Leadership', 'Strategy', 'Fundraising'],
            kpis: {
                tasksCompleted: 95,
                tasksTotal: 100,
                attendanceRate: 99,
                performanceScore: 97,
                productivityScore: 96
            }
        }
    ];

    const employeeIds = {};
    const branchEmployeeCounts = {};

    // First pass - create all employees for each branch (increase total by duplicating base set per branch)
    console.log("👥 Creating Employees across all branches (expanded)...");
    for (let bIdx = 0; bIdx < branchIds.length; bIdx++) {
        const branchId = branchIds[bIdx].id;
        branchEmployeeCounts[branchId] = 0;
        const depts = departmentIdsByBranch[branchId];
        const teams = teamIdsByBranch[branchId];

        for (let idx = 0; idx < employeeData.length; idx++) {
            const emp = employeeData[idx];
            const dept = depts.find(d => d.name === emp.department) || depts[0];
            const team = teams.find(t => t.name === emp.team) || teams[0];
            const floorObj = floorIds.find(f => f.name === emp.floorId && f.branchId === branchId);

            // Ensure unique emails per branch
            const [local, domain] = emp.email.split('@');
            const uniqueEmail = `${local}+b${branchId}@${domain}`;

            const res = await post('employees', {
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: uniqueEmail,
                phone: emp.phone,
                jobTitle: emp.role,
                department: dept.id,
                team: team.id,
                branch: branchId,
                floor: floorObj ? floorObj.id : (floorIds.find(f => f.branchId === branchId)?.id || floorIds[0].id),
                hireDate: emp.joinDate,
                employmentStatus: 'active'
            });

            if (res.data) {
                branchEmployeeCounts[branchId]++;
                employeeIds[`${branchId}:${emp.firstName} ${emp.lastName}`] = { id: res.data.id, team: emp.team, department: emp.department, branchId };
                console.log(`✓ Created ${emp.firstName} ${emp.lastName} in ${branchIds[bIdx].name}`);
            }
        }
    }

    // Second pass - assign supervisors and team leaders/department heads
    console.log("\n👔 Assigning Supervisors (per branch)...");
    for (const b of branchIds) {
        for (const emp of employeeData) {
            const empData = employeeIds[`${b.id}:${emp.firstName} ${emp.lastName}`];
            const supervisorData = employeeIds[`${b.id}:${emp.supervisorName}`];
            if (empData && supervisorData && supervisorData.id !== empData.id) {
                await put('employees', empData.id, { supervisor: supervisorData.id });
                console.log(`✓ [${b.name}] ${emp.firstName} ${emp.lastName} -> Supervisor: ${emp.supervisorName}`);
            }
        }
    }

    // Assign team leaders (most senior by performance in each team)
    console.log("\n👥 Assigning Team Leaders (per branch)...");
    for (const b of branchIds) {
        const teamMap = {};
        for (const emp of employeeData) {
            const empData = employeeIds[`${b.id}:${emp.firstName} ${emp.lastName}`];
            if (empData) {
                const key = emp.team;
                if (!teamMap[key]) teamMap[key] = [];
                teamMap[key].push({ name: `${emp.firstName} ${emp.lastName}`, perfScore: emp.kpis.performanceScore, id: empData.id });
            }
        }
        for (const [teamName, members] of Object.entries(teamMap)) {
            if (members.length > 0) {
                const leader = members.reduce((max, m) => (m.perfScore > max.perfScore ? m : max));
                const teamId = (teamIdsByBranch[b.id] || []).find(t => t.name === teamName)?.id;
                if (teamId) {
                    // Strapi v4 REST expects direct relation IDs for oneToOne
                    await put('teams', teamId, { leaderEmployee: leader.id });
                    console.log(`✓ [${b.name}] Team ${teamName} -> Leader: ${leader.name}`);
                }
            }
        }
    }

    // Assign department heads (most senior by performance in each department)
    console.log("\n🏛️ Assigning Department Heads (per branch)...");
    for (const b of branchIds) {
        const deptMap = {};
        for (const emp of employeeData) {
            const empData = employeeIds[`${b.id}:${emp.firstName} ${emp.lastName}`];
            if (empData) {
                const key = emp.department;
                if (!deptMap[key]) deptMap[key] = [];
                deptMap[key].push({ name: `${emp.firstName} ${emp.lastName}`, perfScore: emp.kpis.performanceScore, id: empData.id });
            }
        }
        for (const [deptName, members] of Object.entries(deptMap)) {
            if (members.length > 0) {
                const head = members.reduce((max, m) => (m.perfScore > max.perfScore ? m : max));
                const deptId = (departmentIdsByBranch[b.id] || []).find(d => d.name === deptName)?.id;
                if (deptId) {
                    // Strapi v4 REST expects direct relation IDs for oneToOne
                    await put('departments', deptId, { headEmployee: head.id });
                    console.log(`✓ [${b.name}] Department ${deptName} -> Head: ${head.name}`);
                }
            }
        }
    }

    // Third pass - assign skills
    console.log("\n🎯 Assigning Employee Skills (per branch)...");
    for (const b of branchIds) {
        for (const emp of employeeData) {
            const empData = employeeIds[`${b.id}:${emp.firstName} ${emp.lastName}`];
            if (empData) {
                for (const skillName of emp.skills) {
                    const skillId = skillIds[skillName];
                    if (skillId) {
                        await post('employee-skills', {
                            employee: empData.id,
                            skill: skillId,
                            proficiencyLevel: "advanced"
                        });
                    }
                }
                console.log(`✓ [${b.name}] Assigned ${emp.skills.length} skills to ${emp.firstName} ${emp.lastName}`);
            }
        }
    }

    // Fourth pass - create KPIs for each employee
    console.log("\n📊 Creating Employee KPIs (per branch)...");
    for (const b of branchIds) {
        for (const emp of employeeData) {
            const empData = employeeIds[`${b.id}:${emp.firstName} ${emp.lastName}`];
            if (empData) {
                const today = new Date();
                const kpiDate = today.toISOString().split('T')[0];
                await post('employee-kpis', {
                    employee: empData.id,
                    date: kpiDate,
                    tasksCompleted: emp.kpis.tasksCompleted,
                    tasksTotal: emp.kpis.tasksTotal,
                    attendanceRate: emp.kpis.attendanceRate,
                    performanceScore: emp.kpis.performanceScore,
                    productivityScore: emp.kpis.productivityScore
                });
                console.log(`✓ [${b.name}] Created KPI for ${emp.firstName} ${emp.lastName}`);
            }
        }
    }

    // ===== BRANCH-LEVEL DATA (Financials, Satisfaction, KPIs History) =====
    const today = new Date();

    // ===== ATTENDANCE (30-day history) =====
    console.log("\n📅 Creating Attendance Records (30-day history)...");
    const allEmployees = Object.values(employeeIds);
    for (const empEntry of allEmployees) {
        for (let day = 29; day >= 0; day--) {
            const attendanceDate = new Date();
            attendanceDate.setDate(today.getDate() - day);
            const isPresent = Math.random() > 0.05; // ~95% attendance
            await post('attendance-records', {
                employee: empEntry.id,
                date: attendanceDate.toISOString().split('T')[0],
                attendanceStatus: isPresent ? 'present' : 'absent',
                checkInTime: isPresent ? '08:00:00' : null,
                checkOutTime: isPresent ? '17:00:00' : null
            });
        }
    }

    // ===== TASKS (assign realistic workload and roll up counts per employee) =====
    console.log("\n📋 Assigning Tasks and updating employee task counters...");
    const taskTitles = [
        "API Integration", "Database Optimization", "UI Redesign", "Bug Fix", "Feature Development",
        "Code Review", "Testing", "Documentation", "Security Audit", "Performance Tuning",
        "Client Meeting Prep", "Sprint Planning", "Database Migration", "Payment Gateway Integration",
        "Mobile App Update", "Server Maintenance", "User Authentication", "Data Analytics Dashboard",
        "Email Service Setup", "Third-party API Integration", "Cache Optimization", "Load Testing"
    ];
    const totalTasks = 200;
    const lateTasks = 45; // ~22% late
    const completedTasks = 120; // 60%
    const inProgressTasks = 35; // ~18%
    const todoTasks = totalTasks - lateTasks - completedTasks - inProgressTasks;

    const employeeTaskStats = new Map(); // empId -> { inProgress, overdue }
    for (const empEntry of allEmployees) {
        employeeTaskStats.set(empEntry.id, { inProgress: 0, overdue: 0 });
    }

    let taskCounter = 0;
    for (let i = 0; i < totalTasks; i++) {
        const empEntry = allEmployees[Math.floor(Math.random() * allEmployees.length)];
        let status, priority, dueDate;

        if (taskCounter < lateTasks) {
            status = 'in-progress';
            priority = 'high';
            dueDate = new Date();
            dueDate.setDate(today.getDate() - (Math.floor(Math.random() * 10) + 1)); // overdue 1-10 days
        } else if (taskCounter < lateTasks + completedTasks) {
            status = 'completed';
            priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
            dueDate = new Date();
            dueDate.setDate(today.getDate() + Math.floor(Math.random() * 14)); // due within 2 weeks
        } else if (taskCounter < lateTasks + completedTasks + inProgressTasks) {
            status = 'in-progress';
            priority = 'medium';
            dueDate = new Date();
            dueDate.setDate(today.getDate() + (Math.floor(Math.random() * 7) + 1)); // due in 1-7 days
        } else {
            status = 'todo';
            priority = 'low';
            dueDate = new Date();
            dueDate.setDate(today.getDate() + (Math.floor(Math.random() * 21) + 7)); // due in 1-3 weeks
        }

        const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];
        await post('tasks', {
            title: `${title} #${i + 1}`,
            description: 'Task assigned to team member for completion',
            taskStatus: status,
            priority: priority,
            dueDate: dueDate.toISOString().split('T')[0],
            assignedTo: empEntry.id
        });

        // Update per-employee counters
        const stats = employeeTaskStats.get(empEntry.id);
        if (status === 'in-progress') stats.inProgress++;
        const isOverdue = (dueDate < today) && status !== 'completed';
        if (isOverdue) stats.overdue++;

        taskCounter++;
    }

    // Persist employee task counters
    for (const [empId, stats] of employeeTaskStats.entries()) {
        await put('employees', empId, {
            tasksInProgress: stats.inProgress,
            tasksOverdue: stats.overdue
        });
    }

    console.log("\n💰 Creating Branch Financial Records...");
    for (const b of branchIds) {
        const monthlyRevenue = Math.round(b.target * (0.85 + Math.random() * 0.25)); // 85-110% of target
        await post('branch-financials', {
            branch: b.id,
            date: today.toISOString().split('T')[0],
            revenue: monthlyRevenue,
            expenses: Math.round(monthlyRevenue * 0.7)
        });
    }

    console.log("😊 Creating Satisfaction Surveys...");
    const activeEmployeeEntries = Object.values(employeeIds);
    for (const empEntry of activeEmployeeEntries) {
        const surveyCount = Math.floor(Math.random() * 2) + 1; // 1-2 surveys in last 30 days
        for (let i = 0; i < surveyCount; i++) {
            const surveyDate = new Date();
            surveyDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
            const bId = empEntry.branchId;
            const bIdx = branchIds.findIndex(b => b.id === bId);
            const baseScore = bIdx === 0 ? 85 : (bIdx === 1 ? 78 : 72);
            await post('satisfaction-surveys', {
                branch: bId,
                date: surveyDate.toISOString().split('T')[0],
                score: Math.round(baseScore + (Math.random() * 10)),
                respondent: empEntry.id
            });
        }
    }

    console.log("📈 Generating 30 Days of Branch KPIs History...");
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        for (let bIdx = 0; bIdx < branchIds.length; bIdx++) {
            const b = branchIds[bIdx];

            // Base scores per branch (Riyadh high, Jeddah medium, Dammam improving)
            let prodBase, satisfactionBase, growthBase;
            if (bIdx === 0) { // Riyadh
                prodBase = 88;
                satisfactionBase = 87;
                growthBase = 4;
            } else if (bIdx === 1) { // Jeddah
                prodBase = 82;
                satisfactionBase = 80;
                growthBase = 2;
            } else { // Dammam
                prodBase = 76 + (i <= 10 ? 5 : 0);
                satisfactionBase = 75 + (i <= 10 ? 4 : 0);
                growthBase = 2 + (i <= 10 ? 2 : 0);
            }

            const prodScore = Math.round(prodBase + (Math.random() * 6 - 3));
            const satisfactionScore = Math.round(satisfactionBase + (Math.random() * 6 - 3));
            const growthRate = Math.round(growthBase + (Math.random() * 3 - 1.5));

            // Revenue daily approximation
            const variance = 0.92 + (Math.random() * 0.16);
            const dailyRevenue = Math.round((b.target / 30) * variance);

            // Late tasks share per branch
            const branchLateShare = bIdx === 0 ? 12 : (bIdx === 1 ? 18 : 15);
            const lateCount = Math.round(branchLateShare * (0.85 + Math.random() * 0.3));

            // Employee counts based on seeded data per branch
            const employeeCount = branchEmployeeCounts[b.id] || (bIdx === 0 ? 6 : (bIdx === 1 ? 4 : 3));
            const joinedCount = (i <= 9 && bIdx < 2) ? Math.floor(Math.random() * 2) : 0;
            const leftCount = (i <= 9 && bIdx === 2) ? 1 : 0;

            await post('branch-kpis', {
                branch: b.id,
                date: dateStr,
                revenue: dailyRevenue * 30,
                revenueTarget: b.target,
                productivityScore: prodScore,
                satisfactionScore: satisfactionScore,
                growthRate: growthRate,
                overdueTaskCount: lateCount,
                employeeCount: employeeCount,
                joinedCount: joinedCount,
                leftCount: leftCount,
                performanceRating: prodScore > 85 ? 'excellent' : (prodScore > 75 ? 'good' : 'average')
            });
        }
    }


    console.log("\n✅ COMPLETE! Database fully populated with employees, tasks, attendance, and branch KPIs!");
    console.log(`\n📊 Summary:`);
    console.log(`   - ${employeeData.length} employees created with full details`);
    console.log(`   - All departments, teams, and skills created`);
    console.log(`   - Attendance: 30-day history per employee`);
    console.log(`   - Tasks: 200 created (120 completed, 45 late, 35 in-progress)`);
    console.log(`   - Employee task counters updated (in-progress/overdue)`);
    console.log(`   - KPI data created for each employee`);
    console.log(`   - Branch financials, satisfaction surveys, and 30-day KPIs generated`);
    console.log(`   - Supervisor relationships established`);
}

seed().catch(err => console.error("Error:", err));