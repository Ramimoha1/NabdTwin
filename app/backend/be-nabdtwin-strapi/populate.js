
const API_URL = 'http://localhost:3001/api'; 
// ⚠️ Since we are bypassing auth, make sure your POST routes are set to auth: false!

async function deleteAllData() {
    console.log("🗑️  Deleting all existing data...");
    
    const get = async (endpoint) => {
        const res = await fetch(`${API_URL}/${endpoint}?pagination[pageSize]=1000`);
        return res.json();
    };
    
    const deleteItem = async (endpoint, id) => {
        await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
    };
    
    // Delete in reverse order of dependencies
    const collections = [
        'employee-kpis',
        'team-kpis',
        'department-kpis',
        'branch-kpis',
        'tasks',
        'workspaces',
        'floors',
        'employees',
        'teams',
        'departments',
        'branches',
        'organizations'
    ];
    
    for (const collection of collections) {
        try {
            const data = await get(collection);
            if (data.data && Array.isArray(data.data)) {
                console.log(`  Deleting ${data.data.length} ${collection}...`);
                for (const item of data.data) {
                    await deleteItem(collection, item.id);
                }
            }
        } catch (err) {
            console.log(`  Skipped ${collection}: ${err.message}`);
        }
    }
    console.log("✅ All data deleted!\n");
}

async function seed() {
    console.log("🚀 Starting Data Population...");
    
    // Delete all existing data first
    await deleteAllData();

    // We modify the post function to remove the 'Authorization' header.
    const post = async (endpoint, data) => {
        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, // No Authorization header
            body: JSON.stringify({ data })
        });
        return res.json();
    };

  // 2. CREATE ORGANIZATION
  console.log("🏢 Creating Organization...");
  const orgRes = await post('organizations', { name: "TechCorp Saudi", industry: "Technology" });
  const orgId = orgRes.data?.id;

  // 3. CREATE BRANCHES (For Map View) - 4 branches
  console.log("📍 Creating Branches...");
  const branches = [
    { name: "Riyadh HQ", city: "Riyadh", lat: 24.7136, lng: 46.6753, target: 5000000 },
    { name: "Jeddah Hub", city: "Jeddah", lat: 21.5433, lng: 39.1728, target: 3000000 },
    { name: "Dammam Port", city: "Dammam", lat: 26.4207, lng: 50.0888, target: 2000000 },
    { name: "Tabuk Office", city: "Tabuk", lat: 28.3838, lng: 36.5550, target: 1500000 }
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

  // 4. CREATE DEPARTMENTS (Before Employees)
  console.log("🏢 Creating Departments...");
  const departments = [
    { name: "Engineering", code: "ENG" },
    { name: "Design", code: "DES" },
    { name: "Sales", code: "SAL" },
    { name: "HR", code: "HR" },
    { name: "Operations", code: "OPS" }
  ];
  
  const deptIds = [];
  for (const dept of departments) {
    const randomBranch = branchIds[Math.floor(Math.random() * branchIds.length)];
    const res = await post('departments', {
      name: dept.name,
      code: dept.code,
      description: `${dept.name} Department`,
      organization: orgId,
      branch: randomBranch.id // Randomly assign to one of 4 branches
    });
    if(res.data) deptIds.push({ id: res.data.id, name: dept.name });
  }

  // 4.5 CREATE TEAMS (After Departments)
  console.log("👥 Creating Teams...");
  const teamDefs = [
    // Engineering teams
    { name: "Backend Team", dept: 0 },
    { name: "Frontend Team", dept: 0 },
    { name: "DevOps Team", dept: 0 },
    // Design teams
    { name: "UI/UX Team", dept: 1 },
    { name: "Brand Team", dept: 1 },
    // Sales teams
    { name: "Enterprise Sales", dept: 2 },
    { name: "Regional Sales", dept: 2 },
    // HR team
    { name: "Recruitment", dept: 3 },
    // Operations team
    { name: "Infrastructure", dept: 4 }
  ];

  const teamIds = [];
  for (const team of teamDefs) {
    const randomBranch = branchIds[Math.floor(Math.random() * branchIds.length)];
    const res = await post('teams', {
      name: team.name,
      description: `${team.name} - Team`,
      department: deptIds[team.dept].id,
      branch: randomBranch.id // Randomly assign to one of 4 branches
    });
    if(res.data) teamIds.push({ id: res.data.id, name: team.name, deptIdx: team.dept });
  }

  // 4.6 CREATE FLOORS AND WORKSPACES (Required for KPI calculations)
  console.log("🏢 Creating Floors and Workspaces...");
  const floorIds = [];
  for (const b of branchIds) {
    // Create 2 floors per branch
    for (let f = 1; f <= 2; f++) {
      const floorRes = await post('floors', {
        name: `Floor ${f}`,
        floorNumber: f,
        branch: b.id
      });
      
      if (floorRes.data) {
        floorIds.push(floorRes.data.id);
        
        // Create 3 workspaces per floor
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

  // 5. CREATE EMPLOYEES (For HR Insights & Top Employees)
  console.log("👥 Hiring Employees...");
  const employeeIds = [];
  const names = [
    // Riyadh team (15 employees) - High performers
    "Sara Ahmed", "Omar Khalil", "Laila Hassan", "Noor Ibrahim", "Hassan Mohamed",
    "Fatima Ali", "Kareem Yousef", "Maha Salem", "Tariq Al-Fayez", "Reem Al-Saud",
    "Aisha Mansour", "Khalid Rashid", "Noura Fahd", "Abdullah Saeed", "Mariam Nasser",
    
    // Jeddah team (12 employees) - Medium performers
    "Youssef Hamza", "Lina Kamal", "Faisal Omar", "Hind Saleh", "Majid Yusuf",
    "Salma Ismail", "Rayan Khalid", "Amira Hasan", "Zaid Fawaz", "Huda Sami",
    "Nabil Ahmed", "Rana Khaled",
    
    // Dammam team (8 employees) - Growing team
    "Fahad Nour", "Leila Abbas", "Mansour Ali", "Nadia Salem", "Waleed Tariq",
    "Yasmin Rafiq", "Hamza Rashad", "Dina Farah"
  ];
  
  const jobTitles = ["Senior Developer", "Developer", "Junior Developer", "Team Lead", "Tech Lead", "Software Engineer", "Backend Developer", "Frontend Developer"];
  
  const today = new Date();
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(today.getDate() - 30);

  // Employee to department/team mapping
  const empDeptTeamMap = [
    // Riyadh Engineering (Backend Team)
    { dept: 0, team: 0 }, { dept: 0, team: 0 }, { dept: 0, team: 0 }, { dept: 0, team: 0 }, { dept: 0, team: 0 },
    // Riyadh Engineering (Frontend Team)
    { dept: 0, team: 1 }, { dept: 0, team: 1 }, { dept: 0, team: 1 },
    // Riyadh Design
    { dept: 1, team: 3 }, { dept: 1, team: 3 }, { dept: 1, team: 3 },
    // Riyadh Sales
    { dept: 2, team: 5 }, { dept: 2, team: 5 },
    // Riyadh HR
    { dept: 3, team: 7 },
    
    // Jeddah Sales (Regional)
    { dept: 2, team: 6 }, { dept: 2, team: 6 }, { dept: 2, team: 6 }, { dept: 2, team: 6 },
    // Jeddah Design (Brand)
    { dept: 1, team: 4 }, { dept: 1, team: 4 }, { dept: 1, team: 4 },
    // Jeddah Operations
    { dept: 4, team: 8 }, { dept: 4, team: 8 }, { dept: 4, team: 8 }, { dept: 4, team: 8 },
    // Jeddah Engineering
    { dept: 0, team: 2 }, { dept: 0, team: 2 },
    
    // Dammam Mixed teams
    { dept: 0, team: 0 }, { dept: 0, team: 0 }, { dept: 0, team: 1 }, { dept: 0, team: 1 },
    { dept: 2, team: 6 }, { dept: 2, team: 6 }, { dept: 4, team: 8 }, { dept: 4, team: 8 }
  ];

  for (let i = 0; i < names.length; i++) {
    const [first, last] = names[i].split(" ");
    
    // Randomly assign to one of the 4 branches
    const randomBranch = branchIds[Math.floor(Math.random() * branchIds.length)];
    const floor = floorIds[Math.floor(Math.random() * floorIds.length)]; // Random floor
    
    // Get department and team assignment
    const deptTeamAssignment = empDeptTeamMap[i];
    const dept = deptIds[deptTeamAssignment.dept];
    const team = teamIds[deptTeamAssignment.team];
    
    // Make some join recently (for "Joined" metric) - in current month (December)
    const isNew = i >= 30 && i < 40; // 10 recent hires
    let hireDate;
    if (isNew) {
      // Random date in December 1-9
      const dayOfMonth = Math.floor(Math.random() * 9) + 1;
      hireDate = new Date(2025, 11, dayOfMonth); // December is month 11 (0-indexed)
    } else {
      // Older employees - hired between Jan 2023 - Nov 2025
      const monthsAgo = Math.floor(Math.random() * 24) + 1;
      hireDate = new Date();
      hireDate.setMonth(today.getMonth() - monthsAgo);
    }
    
    // Make some resigned recently (for "Resigned" metric) - in current month (December)
    const isResigned = i >= 27 && i <= 29; // 3 resignations
    let termDate = null;
    if (isResigned) {
      // Random date in December 1-9
      const dayOfMonth = Math.floor(Math.random() * 9) + 1;
      termDate = new Date(2025, 11, dayOfMonth);
    }
    const status = isResigned ? 'inactive' : 'active';
    
    const jobTitle = jobTitles[i % jobTitles.length];

    const res = await post('employees', {
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@techcorp.sa`,
      branch: randomBranch.id,
      floor: floor,
      department: dept.id,
      team: team.id,
      jobTitle: jobTitle,
      hireDate: hireDate.toISOString().split('T')[0],
      terminationDate: termDate ? termDate.toISOString().split('T')[0] : null,
      employmentStatus: status
    });
    if(res.data) employeeIds.push(res.data.id);
  }

  // 5.5. CREATE EMPLOYEE KPIs (For Productivity Calculations & 30-Day History)
  console.log("📊 Creating Employee KPIs (30-day history)...");
  for (const empId of employeeIds) {
    // Create 30 days of history for each employee
    for (let day = 29; day >= 0; day--) {
      const kpiDate = new Date();
      kpiDate.setDate(today.getDate() - day);
      
      await post('employee-kpis', {
        employee: empId,
        date: kpiDate.toISOString().split('T')[0],
        productivityScore: Math.round(80 + (Math.random() * 15)), // 80-95 (higher range)
        taskCompletionRate: Math.round(80 + (Math.random() * 15)), // 80-95
        attendanceRate: Math.round(90 + (Math.random() * 10)) // 90-100
      });
    }
  }

  // 5.6. CREATE ATTENDANCE RECORDS (For 30-day history - affects productivity calculation)
  console.log("📅 Creating Attendance Records (30-day history)...");
  for (const empId of employeeIds) {
    for (let day = 29; day >= 0; day--) {
      const attendanceDate = new Date();
      attendanceDate.setDate(today.getDate() - day);
      
      // 95% attendance rate (19 out of 20 days present)
      const isPresent = Math.random() > 0.05;
      
      await post('attendance-records', {
        employee: empId,
        date: attendanceDate.toISOString().split('T')[0],
        attendanceStatus: isPresent ? 'present' : 'absent',
        checkInTime: isPresent ? '08:00:00' : null,
        checkOutTime: isPresent ? '17:00:00' : null
      });
    }
  }

  // 6. CREATE TASKS (For Task Metrics & Late Tasks)
  console.log("📋 Assigning Tasks...");
  const statuses = ['completed', 'in-progress', 'todo'];
  const taskTitles = [
    "API Integration", "Database Optimization", "UI Redesign", "Bug Fix", "Feature Development",
    "Code Review", "Testing", "Documentation", "Security Audit", "Performance Tuning",
    "Client Meeting Prep", "Sprint Planning", "Database Migration", "Payment Gateway Integration",
    "Mobile App Update", "Server Maintenance", "User Authentication", "Data Analytics Dashboard",
    "Email Service Setup", "Third-party API Integration", "Cache Optimization", "Load Testing"
  ];
  
  // Create 200 tasks for more realistic metrics
  const totalTasks = 200;
  const lateTasks = 45; // ~22% late (realistic for growing team)
  const completedTasks = 120; // 60% completion rate
  const inProgressTasks = 35; // 17.5%
  const todoTasks = totalTasks - lateTasks - completedTasks - inProgressTasks; // Remaining
  
  let taskCounter = 0;
  
  for (let i = 0; i < totalTasks; i++) {
    const empId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
    
    let status, priority, dueDate;
    const taskDate = new Date();
    
    if (taskCounter < lateTasks) {
      // Late tasks - overdue
      status = 'in-progress';
      priority = 'high';
      dueDate = new Date();
      dueDate.setDate(today.getDate() - Math.floor(Math.random() * 10) - 1); // 1-10 days overdue
    } else if (taskCounter < lateTasks + completedTasks) {
      // Completed tasks
      status = 'completed';
      priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
      dueDate = new Date();
      dueDate.setDate(today.getDate() + Math.floor(Math.random() * 14)); // Due within 2 weeks
    } else if (taskCounter < lateTasks + completedTasks + inProgressTasks) {
      // In-progress tasks (on time)
      status = 'in-progress';
      priority = 'medium';
      dueDate = new Date();
      dueDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1); // Due in 1-7 days
    } else {
      // Todo tasks
      status = 'todo';
      priority = 'low';
      dueDate = new Date();
      dueDate.setDate(today.getDate() + Math.floor(Math.random() * 21) + 7); // Due in 1-3 weeks
    }
    
    const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];
    
    await post('tasks', {
      title: `${title} #${i + 1}`,
      description: `Task assigned to team member for completion`,
      taskStatus: status,
      priority: priority,
      dueDate: dueDate.toISOString().split('T')[0],
      assignedTo: empId
    });
    
    taskCounter++;
  }

  // 7. CREATE BRANCH FINANCIAL RECORDS (For Revenue KPIs)
  console.log("💰 Creating Branch Financial Records...");
  for (const b of branchIds) {
    const monthlyRevenue = Math.round(b.target * (0.8 + Math.random() * 0.3)); // 80-110% of target
    await post('branch-financials', {
      branch: b.id,
      date: today.toISOString().split('T')[0],
      revenue: monthlyRevenue,
      expenses: Math.round(monthlyRevenue * 0.7)
    });
  }

  // 7.5. CREATE SATISFACTION SURVEYS (For Branch Satisfaction Score)
  console.log("😊 Creating Satisfaction Surveys...");
  // More surveys per employee for better data
  const activeEmployees = employeeIds.slice(0, -3); // Exclude resigned employees
  for (const empId of activeEmployees) {
    // Each employee gives 1-2 feedback in last 30 days
    const surveyCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < surveyCount; i++) {
      const surveyDate = new Date();
      surveyDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      // Branch-specific satisfaction trends (Riyadh higher, Dammam improving)
      const empIndex = employeeIds.indexOf(empId);
      let baseScore;
      // Distribute across 4 branches randomly since employees are randomly assigned
      const empBranchIdx = Math.floor(Math.random() * branchIds.length);
      
      if (empBranchIdx === 0) baseScore = 85; // Riyadh: high satisfaction
      else if (empBranchIdx === 1) baseScore = 78; // Jeddah: medium satisfaction
      else if (empBranchIdx === 2) baseScore = 72; // Dammam: lower satisfaction
      else baseScore = 80; // Tabuk: good satisfaction
      
      const branchId = branchIds[empBranchIdx].id;
      
      await post('satisfaction-surveys', {
        branch: branchId,
        date: surveyDate.toISOString().split('T')[0],
        score: Math.round(baseScore + (Math.random() * 10)), // ±10 variance
        respondent: empId
      });
    }
  }

  // 8. GENERATE HISTORY (For Trends Chart)
  console.log("📈 Generating 30 Days of History...");
  const actualLateTasks = 45; // Match the 45 late tasks we create
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    for (let bIdx = 0; bIdx < branchIds.length; bIdx++) {
      const b = branchIds[bIdx];
      
      // Create realistic trends with branch-specific patterns
      let prodBase, satisfactionBase, growthBase;
      
      if (bIdx === 0) { // Riyadh - high performer, steady
        prodBase = 88;
        satisfactionBase = 87;
        growthBase = 4;
      } else if (bIdx === 1) { // Jeddah - medium, slightly declining
        prodBase = 82;
        satisfactionBase = 80;
        growthBase = 1;
      } else if (bIdx === 2) { // Dammam - lower but improving over time
        prodBase = 75 + (i <= 10 ? 5 : 0); // Boost in recent days
        satisfactionBase = 74 + (i <= 10 ? 4 : 0); // Improving trend
        growthBase = 2 + (i <= 10 ? 2 : 0); // Growth accelerating
      } else { // Tabuk - new office, growing steadily
        prodBase = 78 + (i <= 15 ? 3 : 0); // Gradual improvement
        satisfactionBase = 81;
        growthBase = 3;
      }
      
      // Add realistic daily variance
      const prodScore = Math.round(prodBase + (Math.random() * 6 - 3)); // ±3 daily variance
      const satisfactionScore = Math.round(satisfactionBase + (Math.random() * 6 - 3));
      const growthRate = Math.round(growthBase + (Math.random() * 3 - 1.5)); // ±1.5 variance
      
      // Revenue with realistic fluctuation
      const variance = 0.92 + (Math.random() * 0.16); // 92% to 108%
      const dailyRevenue = Math.round((b.target / 30) * variance);
      
      // Distribute late tasks across branches proportionally
      const branchLateShare = bIdx === 0 ? 12 : (bIdx === 1 ? 18 : (bIdx === 2 ? 15 : 10)); // Tabuk has fewest late tasks
      const lateCount = Math.round(branchLateShare * (0.85 + Math.random() * 0.3)); // ±15% variance

      // Employee counts distributed across 4 branches
      const employeeCount = Math.floor(names.length / branchIds.length) + (bIdx === 0 ? 3 : 0); // Riyadh slightly larger
      
      // Employee changes - reflect realistic hiring/attrition
      const joinedCount = (i <= 9 && bIdx < 2) ? Math.floor(Math.random() * 2) : 0; // 10 hires spread across Dec 1-9
      const leftCount = (i <= 9 && bIdx === 2) ? 1 : 0; // 3 resignations from Dammam

      await post('branch-kpis', {
        branch: b.id,
        date: dateStr,
        revenue: dailyRevenue * 30, // Storing monthly run-rate equivalent
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
    // Simple progress bar
    if (i % 5 === 0) process.stdout.write('.');
  }

  console.log("\n✅ DONE! Backend is populated with realistic, presentation-ready data.");
  console.log("\n📊 Summary:");
  console.log(`   - ${names.length} employees across 4 branches (Riyadh, Jeddah, Dammam, Tabuk)`);
  console.log(`   - ${deptIds.length} departments with ${teamIds.length} teams`);
  console.log(`   - ${totalTasks} tasks (${completedTasks} completed, ${lateTasks} late, ${inProgressTasks} in-progress)`);
  console.log(`   - 30 days of historical KPI data with realistic trends`);
  console.log(`   - Branch-specific performance patterns`);
  console.log(`   - Department and Team assignments randomly distributed`);
}

// CREATE DEPARTMENT KPIs (30-day history)
async function createDepartmentKPIs() {
  console.log("📊 Creating Department KPIs...");
  
  const deptKPIData = [
    { name: "Engineering", baseEfficiency: 92, baseSatisfaction: 88, baseRevenue: 500000 },
    { name: "Design", baseEfficiency: 95, baseSatisfaction: 90, baseRevenue: 150000 },
    { name: "Sales", baseEfficiency: 85, baseSatisfaction: 82, baseRevenue: 800000 },
    { name: "HR", baseEfficiency: 88, baseSatisfaction: 85, baseRevenue: 50000 },
    { name: "Operations", baseEfficiency: 90, baseSatisfaction: 87, baseRevenue: 200000 }
  ];

  const post = async (endpoint, data) => {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    return res.json();
  };

  const today = new Date();
  
  // Fetch departments and teams first
  const deptRes = await fetch(`${API_URL}/departments?pagination[pageSize]=100`);
  const depts = await deptRes.json();
  
  const teamRes = await fetch(`${API_URL}/teams?pagination[pageSize]=100`);
  const teams = await teamRes.json();

  // Debug: Check what we got
  console.log(`   Found ${depts.data?.length || 0} departments`);
  console.log(`   Found ${teams.data?.length || 0} teams`);

  // Create 30 days of department KPIs
  for (const dept of depts.data || []) {
    // Safety check - departments may have flat or nested structure
    const deptName = dept.attributes?.name || dept.name;
    if (!deptName) {
      console.log(`   ⚠️  Skipping department with no name: ${JSON.stringify(dept)}`);
      continue;
    }
    
    const deptData = deptKPIData.find(d => d.name === deptName);
    if (!deptData) {
      console.log(`   ⚠️  No KPI data defined for department: ${deptName}`);
      continue;
    }

    for (let day = 29; day >= 0; day--) {
      const kpiDate = new Date();
      kpiDate.setDate(today.getDate() - day);

      await post('department-kpis', {
        department: dept.id,
        date: kpiDate.toISOString().split('T')[0],
        revenue: Math.round(deptData.baseRevenue * (0.85 + Math.random() * 0.3)),
        revenueTarget: deptData.baseRevenue,
        employeeCount: Math.floor(5 + Math.random() * 10),
        teamCount: 2,
        tasksCompleted: Math.floor(15 + Math.random() * 15),
        tasksTotal: Math.floor(25 + Math.random() * 10),
        efficiencyScore: Math.round(deptData.baseEfficiency + (Math.random() * 8 - 4)),
        satisfactionScore: Math.round(deptData.baseSatisfaction + (Math.random() * 8 - 4))
      });
    }
  }

  // Create 30 days of team KPIs
  for (const team of teams.data || []) {
    // Safety check - teams may have flat or nested structure
    const teamName = team.attributes?.name || team.name;
    if (!teamName) {
      console.log(`   ⚠️  Skipping team with no name: ${JSON.stringify(team)}`);
      continue;
    }
    
    for (let day = 29; day >= 0; day--) {
      const kpiDate = new Date();
      kpiDate.setDate(today.getDate() - day);

      await post('team-kpis', {
        team: team.id,
        date: kpiDate.toISOString().split('T')[0],
        tasksCompleted: Math.floor(8 + Math.random() * 12),
        tasksTotal: Math.floor(15 + Math.random() * 10),
        avgPerformanceScore: Math.round(85 + (Math.random() * 10 - 5)),
        productivityScore: Math.round(82 + (Math.random() * 12 - 6))
      });
    }
  }

  console.log("✅ Department and Team KPIs created!");
}

// Run both seed and KPI creation
async function runFullSeed() {
  try {
    await seed();
    await createDepartmentKPIs();
  } catch (err) {
    console.error("❌ Error during seeding:", err);
  }
}

runFullSeed();