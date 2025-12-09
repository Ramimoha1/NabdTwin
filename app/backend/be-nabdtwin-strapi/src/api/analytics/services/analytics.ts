
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
  }
});