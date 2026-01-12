const API_URL = 'http://localhost:3001/api'; 

async function seed() {
    console.log("🚀 Starting Enhanced Data Population with Employee Details...");

    const post = async (endpoint, data) => {
        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        return res.json();
    };

    const put = async (endpoint, data) => {
        const res = await fetch(`${API_URL}/${endpoint}`, {
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
                floorIds.push({ id: floorRes.data.id, name: f === 1 ? 'ground' : `level${f - 1}` });
                
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
    
    const departmentIds = [];
    for (const dept of departmentData) {
        const res = await post('departments', {
            name: dept.name,
            branch: branchIds[0].id,
            organization: orgId
        });
        if(res.data) departmentIds.push({ id: res.data.id, name: dept.name });
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
    
    const teamIds = [];
    for (const team of teamData) {
        const dept = departmentIds.find(d => d.name === team.department);
        const res = await post('teams', {
            name: team.name,
            department: dept ? dept.id : departmentIds[0].id,
            branch: branchIds[0].id
        });
        if(res.data) teamIds.push({ id: res.data.id, name: team.name });
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
    console.log("👥 Creating Employees with Details...");
    
    const employeeData = [
        // Riyadh - emp-1
        {
            firstName: 'Ahmed',
            lastName: 'Hassan',
            email: 'ahmed.hassan@company.com',
            phone: '+966 50 123 4567',
            role: 'Senior Developer',
            department: 'Engineering',
            team: 'Backend Team',
            branchId: '1',
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
        // Riyadh - emp-2
        {
            firstName: 'Fatima',
            lastName: 'Ali',
            email: 'fatima.ali@company.com',
            phone: '+966 50 999 8888',
            role: 'UI/UX Designer',
            department: 'Design',
            team: 'Creative Team',
            branchId: '1',
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
        // Riyadh - emp-3
        {
            firstName: 'Omar',
            lastName: 'Saleh',
            email: 'omar.saleh@company.com',
            phone: '+966 50 777 1111',
            role: 'Product Manager',
            department: 'Product',
            team: 'Platform',
            branchId: '1',
            floorId: 'ground',
            joinDate: '2022-07-01',
            supervisorName: 'Laila Ahmed',
            skills: ['Roadmapping', 'User Research', 'Agile'],
            kpis: {
                tasksCompleted: 52,
                tasksTotal: 60,
                attendanceRate: 97,
                performanceScore: 89,
                productivityScore: 86
            }
        },
        // Riyadh - emp-4
        {
            firstName: 'Maha',
            lastName: 'Khalil',
            email: 'maha.khalil@company.com',
            phone: '+966 50 222 3333',
            role: 'QA Engineer',
            department: 'Engineering',
            team: 'QA',
            branchId: '1',
            floorId: 'ground',
            joinDate: '2021-11-18',
            supervisorName: 'Sara Mohamed',
            skills: ['Automation', 'Cypress', 'Playwright'],
            kpis: {
                tasksCompleted: 70,
                tasksTotal: 80,
                attendanceRate: 95,
                performanceScore: 90,
                productivityScore: 87
            }
        },
        // Riyadh - emp-5
        {
            firstName: 'Yousef',
            lastName: 'Al Rashid',
            email: 'yousef.rashid@company.com',
            phone: '+966 50 444 5555',
            role: 'Data Engineer',
            department: 'Data',
            team: 'Pipelines',
            branchId: '1',
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
        // Riyadh - emp-6
        {
            firstName: 'Dana',
            lastName: 'Fahd',
            email: 'dana.fahd@company.com',
            phone: '+966 50 666 7777',
            role: 'Frontend Engineer',
            department: 'Engineering',
            team: 'Web',
            branchId: '1',
            floorId: 'level1',
            joinDate: '2022-02-14',
            supervisorName: 'Fatima Ali',
            skills: ['React', 'TypeScript', 'Vite'],
            kpis: {
                tasksCompleted: 55,
                tasksTotal: 65,
                attendanceRate: 94,
                performanceScore: 91,
                productivityScore: 89
            }
        },
        // Riyadh - emp-7
        {
            firstName: 'Hussain',
            lastName: 'Naser',
            email: 'hussain.naser@company.com',
            phone: '+966 50 123 7777',
            role: 'Security Analyst',
            department: 'Security',
            team: 'Blue Team',
            branchId: '1',
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
        // Riyadh - emp-8
        {
            firstName: 'Rania',
            lastName: 'Samir',
            email: 'rania.samir@company.com',
            phone: '+966 50 888 9999',
            role: 'Scrum Master',
            department: 'Product',
            team: 'Delivery',
            branchId: '1',
            floorId: 'level1',
            joinDate: '2021-09-21',
            supervisorName: 'Omar Khalid',
            skills: ['Scrum', 'Kanban', 'Facilitation'],
            kpis: {
                tasksCompleted: 62,
                tasksTotal: 70,
                attendanceRate: 97,
                performanceScore: 90,
                productivityScore: 88
            }
        },
        // Riyadh - emp-9
        {
            firstName: 'Ziad',
            lastName: 'Mansour',
            email: 'ziad.mansour@company.com',
            phone: '+966 50 321 1111',
            role: 'ML Engineer',
            department: 'Data',
            team: 'Models',
            branchId: '1',
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
        // Riyadh - emp-10
        {
            firstName: 'Huda',
            lastName: 'Yasin',
            email: 'huda.yasin@company.com',
            phone: '+966 50 654 2222',
            role: 'Solutions Architect',
            department: 'Architecture',
            team: 'Platform',
            branchId: '1',
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
        // Riyadh - emp-11
        {
            firstName: 'Tariq',
            lastName: 'Jaber',
            email: 'tariq.jaber@company.com',
            phone: '+966 50 765 4321',
            role: 'Support Engineer',
            department: 'Support',
            team: 'L2 Support',
            branchId: '1',
            floorId: 'level2',
            joinDate: '2024-01-05',
            supervisorName: 'Sara Mohamed',
            skills: ['Troubleshooting', 'SLA Management', 'Azure'],
            kpis: {
                tasksCompleted: 22,
                tasksTotal: 25,
                attendanceRate: 95,
                performanceScore: 85,
                productivityScore: 82
            }
        },
        // Riyadh - emp-12
        {
            firstName: 'Rami',
            lastName: 'Yassein',
            email: 'rami.yassein@company.com',
            phone: '+966 50 111 2222',
            role: 'Chief Executive Officer',
            department: 'Executive',
            team: 'Leadership',
            branchId: '1',
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
    const supervisorMap = {};

    // First pass - create all employees
    for (const emp of employeeData) {
        const dept = departmentIds.find(d => d.name === emp.department);
        const team = teamIds.find(t => t.name === emp.team);
        const floorObj = floorIds.find(f => f.name === emp.floorId);

        const res = await post('employees', {
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone,
            jobTitle: emp.role,
            department: dept ? dept.id : departmentIds[0].id,
            team: team ? team.id : teamIds[0].id,
            branch: branchIds[0].id,
            floor: floorObj ? floorObj.id : floorIds[0].id,
            hireDate: emp.joinDate,
            employmentStatus: 'active'
        });

        if(res.data) {
            employeeIds[`${emp.firstName} ${emp.lastName}`] = res.data.id;
            console.log(`✓ Created ${emp.firstName} ${emp.lastName}`);
        }
    }

    // Second pass - assign supervisors
    console.log("\n👔 Assigning Supervisors...");
    for (const emp of employeeData) {
        const empId = employeeIds[`${emp.firstName} ${emp.lastName}`];
        const supervisorId = employeeIds[emp.supervisorName];
        
        if (empId && supervisorId && supervisorId !== empId) {
            await put(`employees/${empId}`, { supervisor: supervisorId });
            console.log(`✓ ${emp.firstName} ${emp.lastName} -> Supervisor: ${emp.supervisorName}`);
        }
    }

    // Third pass - assign skills
    console.log("\n🎯 Assigning Employee Skills...");
    for (const emp of employeeData) {
        const empId = employeeIds[`${emp.firstName} ${emp.lastName}`];
        if (empId) {
            for (const skillName of emp.skills) {
                const skillId = skillIds[skillName];
                if (skillId) {
                    await post('employee-skills', {
                        employee: empId,
                        skill: skillId,
                        proficiencyLevel: "advanced"
                    });
                }
            }
            console.log(`✓ Assigned ${emp.skills.length} skills to ${emp.firstName} ${emp.lastName}`);
        }
    }

    // Fourth pass - create KPIs for each employee
    console.log("\n📊 Creating Employee KPIs...");
    for (const emp of employeeData) {
        const empId = employeeIds[`${emp.firstName} ${emp.lastName}`];
        if (empId) {
            const today = new Date();
            const kpiDate = today.toISOString().split('T')[0];
            
            await post('employee-kpis', {
                employee: empId,
                date: kpiDate,
                tasksCompleted: emp.kpis.tasksCompleted,
                tasksTotal: emp.kpis.tasksTotal,
                attendanceRate: emp.kpis.attendanceRate,
                performanceScore: emp.kpis.performanceScore,
                productivityScore: emp.kpis.productivityScore
            });
            console.log(`✓ Created KPI for ${emp.firstName} ${emp.lastName}`);
        }
    }

    console.log("\n✅ DONE! Backend populated with employee detail data!");
    console.log(`\n📊 Summary:`);
    console.log(`   - ${employeeData.length} employees created`);
    console.log(`   - ${departmentData.length} departments`);
    console.log(`   - ${teamData.length} teams`);
    console.log(`   - All skills assigned`);
    console.log(`   - KPI data created for each employee`);
}

seed().catch(err => console.error("Error:", err));
