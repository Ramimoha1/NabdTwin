
const { factories } = require('@strapi/strapi');

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

module.exports = ({ strapi }) => ({

  // ============================================================
  // 1. EMPLOYEE LEVEL
  // ============================================================
  async getEmployeeKPI(employeeId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    const [employee, tasks, attendance] = await Promise.all([
      strapi.db.query('api::employee.employee').findOne({ where: { id: employeeId } }),
      strapi.db.query('api::task.task').findMany({ where: { assignedTo: employeeId } }),
      strapi.db.query('api::attendance-record.attendance-record').findMany({ where: { employee: employeeId } }),
    ]);

    if (!employee) throw new Error('Employee not found');

    const totalTasks = tasks.length;
    
    const tasksCompleted = tasks.filter((t) => t.taskStatus === 'completed').length;
    const tasksInProgress = tasks.filter((t) => t.taskStatus === 'in-progress' || t.taskStatus === 'todo').length;
    
    const tasksOverdue = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due < todayDate && t.taskStatus !== 'completed';
    }).length;

    const taskRate = totalTasks > 0 ? (tasksCompleted / totalTasks) : 0; 

    const daysPresent = attendance.filter((a) => a.attendanceStatus === 'present').length;
    const attendanceRate = attendance.length > 0 ? (daysPresent / attendance.length) : 0; 
    
    let performanceScore = ((taskRate * 0.5) + (attendanceRate * 0.5)) * 100; 

    const productivityScore = ((taskRate * 0.7) + (attendanceRate * 0.3)) * 100; 

    const kpiData = {
      employee: employeeId,
      date: todayStr,
      tasksCompleted,
      tasksInProgress,
      tasksOverdue,
      tasksTotal: totalTasks,
      attendanceRate: parseFloat((attendanceRate * 100).toFixed(2)),
      performanceScore: parseFloat(performanceScore.toFixed(2)),
      productivityScore: parseFloat(productivityScore.toFixed(2)),
      projectsCompleted: 0,
    };
    
    const existingKPI = await strapi.db.query('api::employee-kpi.employee-kpi').findOne({
      where: { employee: employeeId, date: todayStr },
    });

    if (existingKPI) {
      return await strapi.db.query('api::employee-kpi.employee-kpi').update({
        where: { id: existingKPI.id },
        data: kpiData
      });
    } else {
      return await strapi.db.query('api::employee-kpi.employee-kpi').create({ data: kpiData });
    }
  },

  // ============================================================
  // 2. FLOOR LEVEL
  // ============================================================
  async getFloorKPI(floorId) {
    const today = new Date().toISOString().split('T')[0];

    const workspaces = await strapi.db.query('api::workspace.workspace').findMany({ where: { floor: floorId } });
    const totalCapacity = workspaces.reduce((sum, w) => sum + (w.capacity || 0), 0);
    const employees = await strapi.db.query('api::employee.employee').findMany({ where: { floor: floorId } });
    const occupancyRate = totalCapacity > 0 ? (employees.length / totalCapacity) * 100 : 0;

    if (employees.length === 0) return { message: "No employees on this floor" };

    const employeeKPIs = await Promise.all(employees.map((emp) => this.getEmployeeKPI(emp.id)));
    const validScores = employeeKPIs.map(k => k.productivityScore).filter(s => !isNaN(s));
    const avgProductivity = validScores.reduce((a, b) => a + b, 0) / (validScores.length || 1);
    
    const kpiData = {
      floor: floorId,
      date: today,
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      productivityScore: parseFloat(avgProductivity.toFixed(2)),
    };

    const existingKPI = await strapi.db.query('api::floor-kpi.floor-kpi').findOne({
      where: { floor: floorId, date: today },
    });

    if (existingKPI) {
      return await strapi.db.query('api::floor-kpi.floor-kpi').update({
        where: { id: existingKPI.id },
        data: kpiData
      });
    } else {
      return await strapi.db.query('api::floor-kpi.floor-kpi').create({ data: kpiData });
    }
  },

  // ============================================================
  // 3. BRANCH LEVEL
  // ============================================================
  async getBranchKPI(branchId) {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const branchData = await strapi.db.query('api::branch.branch').findOne({ where: { id: branchId } });
    if (!branchData) throw new Error('Branch not found');

    const floors = await strapi.db.query('api::floor.floor').findMany({ where: { branch: branchId } });
    if (floors.length === 0) return { message: "No floors in this branch" };

    const floorKPIs = await Promise.all(floors.map((floor) => this.getFloorKPI(floor.id)));
    
    const validProd = floorKPIs.map(k => k.productivityScore).filter(s => !isNaN(s));
    const avgProductivity = validProd.reduce((a, b) => a + b, 0) / (validProd.length || 1);

    const surveys = await strapi.db.query('api::satisfaction-survey.satisfaction-survey').findMany({
      where: { branch: branchId },
      orderBy: { date: 'desc' },
      limit: 100 
    });
    const avgSatisfaction = surveys.length > 0 
      ? surveys.reduce((sum, s) => sum + (s.score || 0), 0) / surveys.length
      : 0;

    const financialRecord = await strapi.db.query('api::branch-financial.branch-financial').findOne({
      where: { branch: branchId },
      orderBy: { date: 'desc' }
    });
    const actualRevenue = financialRecord ? parseFloat(financialRecord.revenue) : 0;

    const yesterday = getYesterday();
    const yesterdayKPI = await strapi.db.query('api::branch-kpi.branch-kpi').findOne({
      where: { branch: branchId, date: yesterday }
    });
    let growthRate = 0;
    if (yesterdayKPI && yesterdayKPI.productivityScore > 0) {
      growthRate = ((avgProductivity - yesterdayKPI.productivityScore) / yesterdayKPI.productivityScore) * 100;
    }

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const joinedCount = await strapi.db.query('api::employee.employee').count({
      where: { branch: branchId, hireDate: { $gte: startOfMonth, $lte: endOfMonth } }
    });
    const leftCount = await strapi.db.query('api::employee.employee').count({
      where: { branch: branchId, terminationDate: { $gte: startOfMonth, $lte: endOfMonth }, employmentStatus: { $ne: 'active' } }
    });
    const totalEmployees = await strapi.db.query('api::employee.employee').count({ where: { branch: branchId } });

    const target = branchData.revenueTarget || 1000000; 
    const revenueAchievement = target > 0 ? Math.min((actualRevenue / target) * 100, 120) : 0;
    const weightedScore = (avgProductivity * 0.7) + (revenueAchievement * 0.3);

    let rating = 'poor';
    if (weightedScore >= 90) rating = 'excellent';
    else if (weightedScore >= 75) rating = 'good';
    else if (weightedScore >= 60) rating = 'average';

    const kpiData = {
      branch: branchId,
      date: dateString,
      revenue: actualRevenue, 
      revenueTarget: target, 
      productivityScore: parseFloat(avgProductivity.toFixed(2)),
      satisfactionScore: parseFloat(avgSatisfaction.toFixed(2)),
      growthRate: parseFloat(growthRate.toFixed(2)),
      performanceRating: rating, 
      joinedCount,
      leftCount,
      employeeCount: totalEmployees
    };

    const existingKPI = await strapi.db.query('api::branch-kpi.branch-kpi').findOne({
      where: { branch: branchId, date: dateString },
    });

    if (existingKPI) {
      return await strapi.db.query('api::branch-kpi.branch-kpi').update({
        where: { id: existingKPI.id },
        data: kpiData
      });
    } else {
      return await strapi.db.query('api::branch-kpi.branch-kpi').create({ data: kpiData });
    }
  },

  async getBranchHistory(branchId, fromDate, toDate) {
    return await strapi.db.query('api::branch-kpi.branch-kpi').findMany({
      where: { branch: branchId, date: { $gte: fromDate, $lte: toDate } },
      orderBy: { date: 'asc' },
    });
  },

  async getFloorHistory(floorId, fromDate, toDate) {
    return await strapi.db.query('api::floor-kpi.floor-kpi').findMany({
      where: { floor: floorId, date: { $gte: fromDate, $lte: toDate } },
      orderBy: { date: 'asc' },
    });
  },

  async getEmployeeHistory(employeeId, fromDate, toDate) {
    return await strapi.db.query('api::employee-kpi.employee-kpi').findMany({
      where: { employee: employeeId, date: { $gte: fromDate, $lte: toDate } },
      orderBy: { date: 'asc' },
    });
  },

  // ============================================================
  // 4. GLOBAL INSIGHTS AGGREGATOR
  // ============================================================
  async getGlobalStats() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const branches = await strapi.entityService.findMany('api::branch.branch');
    const branchKPIs = await Promise.all(branches.map(b => this.getBranchKPI(b.id)));
    
    const totalRevenue = branchKPIs.reduce((sum, k) => sum + (k.revenue || 0), 0);
    const totalTarget = branchKPIs.reduce((sum, k) => sum + (k.revenueTarget || 0), 0);
    
    const validProd = branchKPIs.filter(k => k.productivityScore > 0);
    const globalProductivity = validProd.length > 0 
      ? validProd.reduce((sum, k) => sum + k.productivityScore, 0) / validProd.length
      : 0;

    const totalJoined = branchKPIs.reduce((sum, k) => sum + (k.joinedCount || 0), 0);
    const totalLeft = branchKPIs.reduce((sum, k) => sum + (k.leftCount || 0), 0);

    const yesterdayKPIs = await strapi.db.query('api::branch-kpi.branch-kpi').findMany({
        where: { date: yesterdayStr }
    });

    const yRevenue = yesterdayKPIs.reduce((sum, k) => sum + (Number(k.revenue) || 0), 0);
    const yProdSum = yesterdayKPIs.reduce((sum, k) => sum + (Number(k.productivityScore) || 0), 0);
    const yProdAvg = yesterdayKPIs.length > 0 ? yProdSum / yesterdayKPIs.length : 0;

    const calcTrend = (current, previous) => {
        if (previous === 0) return '+100%'; 
        const diff = ((current - previous) / previous) * 100;
        return (diff > 0 ? '+' : '') + diff.toFixed(1) + '%';
    };

    const allTasks = await strapi.db.query('api::task.task').findMany({
        where: { taskStatus: { $ne: 'completed' } } 
    });
    
    const lateCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
    const inProgressCount = allTasks.length;

    return [
      {
        title: 'Productivity',
        value: Math.round(globalProductivity),
        target: 90,
        unit: '%',
        trend: globalProductivity >= yProdAvg ? 'up' : 'down',
        trendValue: calcTrend(globalProductivity, yProdAvg),
        explanation: 'Average efficiency across all branches.',
        color: 'bg-blue-600'
      },
      {
        title: 'Total Revenue',
        value: totalRevenue,
        target: totalTarget,
        unit: 'SAR',
        trend: totalRevenue >= yRevenue ? 'up' : 'down',
        trendValue: calcTrend(totalRevenue, yRevenue),
        explanation: 'Total financial performance.',
        color: 'bg-green-600'
      },
      {
        title: 'Late Tasks',
        value: lateCount,
        unit: '',
        trend: lateCount > 5 ? 'down' : 'up',
        trendValue: 'Live',
        explanation: 'Tasks exceeding deadline.',
        color: 'bg-red-600'
      },
      {
        title: 'Tasks In Progress',
        value: inProgressCount,
        unit: '',
        trend: 'up',
        explanation: 'Current operational load.',
        color: 'bg-amber-600'
      },
      {
        title: 'Employees Joined',
        value: totalJoined,
        unit: '',
        trend: 'up',
        explanation: 'New hires this month.',
        color: 'bg-emerald-600'
      },
      {
        title: 'Employees Resigned',
        value: totalLeft,
        unit: '',
        trend: 'down',
        explanation: 'Turnover this month.',
        color: 'bg-slate-600'
      }
    ];
  },

  // ============================================================
  // 1. TRENDS
  // ============================================================
  async getTrends() {
    const days = 30;
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - days);

    const historicalKPIs = await strapi.db.query('api::branch-kpi.branch-kpi').findMany({
        where: {
            date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] }
        },
        orderBy: { date: 'asc' }
    });

    const trendsMap = new Map();

    historicalKPIs.forEach(kpi => {
        if (!trendsMap.has(kpi.date)) {
            // Added delivery: 0
            trendsMap.set(kpi.date, { date: kpi.date, revenue: 0, productivity: 0, count: 0, lateTasks: 0, employeeCount: 0 });
        }
        const entry = trendsMap.get(kpi.date);
        
        entry.revenue += Number(kpi.revenue) || 0;
        entry.lateTasks += Number(kpi.overdueTaskCount) || 0;
        entry.productivity += Number(kpi.productivityScore) || 0;
        entry.employeeCount += Number(kpi.employeeCount) || 0; // Use employee count to calculate delivery
        entry.count += 1;
    });
    

    return Array.from(trendsMap.values()).map(day => {
        // Calculate Delivery as the inverse of late tasks (penalize a high late task count)
        const avgLatePerEmployee = day.employeeCount > 0 ? (day.lateTasks / day.employeeCount) : 0;
        // A simple way to represent inverse relationship: Start at 100 and subtract a penalty
        const deliveryRate = Math.min(100, Math.max(0, 100 - (avgLatePerEmployee * 5))); // 5 point penalty per overdue task

        return {
            date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: day.revenue,
            productivity: day.count > 0 ? Math.round(day.productivity / day.count) : 0,
            delivery: Math.round(deliveryRate), // <--- NOW DIFFERENT FROM PRODUCTIVITY
            lateTasks: day.lateTasks
        }
    });
  },

  // ============================================================
  // 2.EMPLOYEE CHANGES
  // ============================================================
  async getEmployeeChanges() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const employees = await strapi.db.query('api::employee.employee').findMany({
        where: {
            $or: [
                { hireDate: { $gte: thirtyDaysAgoStr } },
                { terminationDate: { $gte: thirtyDaysAgoStr } }
            ]
        },
        populate: ['branch']
    });
    
    const joinedList = employees.filter(e => e.hireDate && new Date(e.hireDate) >= thirtyDaysAgo);
    const resignedList = employees.filter(e => e.terminationDate && new Date(e.terminationDate) >= thirtyDaysAgo);

    const groupByBranch = (list) => {
        const counts = {};
        list.forEach(e => {
            const bName = e.branch ? e.branch.name.split(' ')[0] : 'Remote';
            counts[bName] = (counts[bName] || 0) + 1;
        });
        return Object.entries(counts).map(([branch, count]) => ({ branch, count }));
    };

    return {
        joined: { 
            count: joinedList.length, 
            change: `+${joinedList.length}`, 
            trend: 'up', 
            details: groupByBranch(joinedList) 
        },
        resigned: { 
            count: resignedList.length, 
            change: `-${resignedList.length}`, 
            trend: resignedList.length > 0 ? 'down' : 'neutral', 
            details: groupByBranch(resignedList) 
        } 
    };
  },

  // ============================================================
  // 3. TASK METRICS 
  // ============================================================
  async getTaskMetrics() {
    const tasks = await strapi.db.query('api::task.task').findMany();
    const total = tasks.length;
    const completed = tasks.filter(t => t.taskStatus === 'completed').length;
    const inProgress = tasks.filter(t => t.taskStatus === 'in-progress' || t.taskStatus === 'todo').length;
    
    const now = new Date();
    const late = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.taskStatus !== 'completed').length;

    const onTimeRate = total > 0 ? Math.round(((total - late) / total) * 100) : 100;

    return [
        { label: 'Total Tasks', value: total, change: '0%', trend: 'neutral', status: 'neutral', icon: 'Clock' },
        { label: 'Completed Tasks', value: completed, change: '0%', trend: 'up', status: 'success', icon: 'CheckCircle' },
        { label: 'Delayed Tasks', value: late, change: '0%', trend: 'down', status: late > 0 ? 'warning' : 'success', icon: 'Clock' },
        { label: 'Tasks In Progress', value: inProgress, change: '0%', trend: 'neutral', status: 'info', icon: 'Loader' },
        { label: 'On-time Delivery Rate', value: `${onTimeRate}%`, change: '0%', trend: onTimeRate > 90 ? 'up' : 'down', status: 'success', icon: 'CheckCircle' }
    ];
  },

  // ============================================================
  // 4. BRANCH COMPARISON
  // ============================================================
  async getBranchComparison() {
    const branches = await strapi.entityService.findMany('api::branch.branch', {
        populate: ['employees'] 
    });
    
    const branchData = await Promise.all(branches.map(async (b) => {
        const kpi = await this.getBranchKPI(b.id); 
        
        const empList = Array.isArray(b.employees) ? b.employees : (b.employees?.data || []);
        const employeeIds = empList.map(e => e.id);

        let taskCount = 0;

        if (employeeIds.length > 0) {
            taskCount = await strapi.db.query('api::task.task').count({
                where: {
                    assignedTo: {
                        id: { $in: employeeIds }
                    }
                }
            });
        }

        let color = '#3b82f6';
        if (kpi.productivityScore >= 80) color = '#10b981';
        else if (kpi.productivityScore < 60) color = '#f59e0b';

        return {
            name: b.name.split(' ')[0],
            score: Math.round(kpi.productivityScore || 0),
            employees: empList.length,
            tasks: taskCount, 
            color: color
        };
    }));
    
    return branchData;
  },

  // ============================================================
  // 5. TOP EMPLOYEES 
  // ============================================================
  async getTopEmployees() {
    const employees = await strapi.entityService.findMany('api::employee.employee', {
        populate: ['branch']
    });

    const rankedEmployees = await Promise.all(employees.map(async (emp) => {
        const kpi = await this.getEmployeeKPI(emp.id); 
        return {
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            branch: emp.branch ? emp.branch.name.split(' ')[0] : 'Remote',
            score: Math.round(kpi.productivityScore || 0),
            tasks: kpi.tasksCompleted,
            avatar: `${emp.firstName[0]}${emp.lastName[0]}`
        };
    }));

    return rankedEmployees.sort((a, b) => b.score - a.score).slice(0, 8);
  },

  // ============================================================
  // 6. EMPLOYEE PERFORMANCE HISTORY (30 Days)
  // ============================================================
  async getEmployeePerformance(employeeId) {
    const days = 30;
    const today = new Date();
    const performanceData = [];

    // Get current tasks for late/in-progress counts
    const allTasks = await strapi.db.query('api::task.task').findMany({
      where: { assignedTo: employeeId }
    });

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const lateTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due < todayDate && t.taskStatus !== 'completed';
    }).length;

    const inProgressTasks = allTasks.filter(t => 
      t.taskStatus === 'in-progress' || t.taskStatus === 'todo'
    ).length;

    // Generate 30 days of data
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Try to get KPI record for this date
      const kpi = await strapi.db.query('api::employee-kpi.employee-kpi').findOne({
        where: { employee: employeeId, date: dateStr }
      });

      performanceData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completion: kpi ? Math.round(kpi.taskCompletionRate || 0) : 0,
        utilization: kpi ? Math.round(kpi.attendanceRate || 0) : 0,
        lateTasks: lateTasks,
        inProgress: inProgressTasks
      });
    }

    return performanceData;
  }
});