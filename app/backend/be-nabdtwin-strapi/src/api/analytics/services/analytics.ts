// @ts-nocheck
/**
 * analytics service
 */

const { factories } = require('@strapi/strapi');

// ============================================================
// ⚙️ CONFIGURATION
// ============================================================
// Set to FALSE to use your Real Database Data
const USE_DEMO_MODE = false;

// Helper: Check if KPI is stale (older than today)
const isStale = (kpi) => {
  if (!kpi) return true;
  const kpiDate = new Date(kpi.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return kpiDate < today;
};

// Helper: Mock Data fallback
const MOCK_DATA = {
  employees: { '1': { performanceScore: 85, productivityScore: 88 } },
  floors: { 'f1': { productivityScore: 80 } },
  branches: { 'b1': { productivityScore: 82 } }
};

module.exports = ({ strapi }) => ({

  /**
   * UC01: Calculate Employee KPI
   */
  async getEmployeeKPI(employeeId) {
    if (USE_DEMO_MODE) return MOCK_DATA.employees[employeeId] || { performanceScore: 0 };

    const today = new Date().toISOString().split('T')[0];

    // 1. Check Cache
    // Querying 'employee' relation (CamelCase)
    let existingKPI = await strapi.db.query('api::employee-kpi.employee-kpi').findOne({
      where: { employee: employeeId, date: today },
    });

    if (existingKPI && !isStale(existingKPI)) {
      return existingKPI;
    }

    // 2. Fetch Raw Data
    const [employee, tasks, attendance] = await Promise.all([
      strapi.db.query('api::employee.employee').findOne({ where: { id: employeeId } }),
      
      // ✅ FIX 1: Use 'assignedTo' (CamelCase) to match Schema
      strapi.db.query('api::task.task').findMany({
        where: { assignedTo: employeeId }, 
      }),
      
      // ✅ FIX 2: Use 'employee' (CamelCase) to match Schema
      strapi.db.query('api::attendance-record.attendance-record').findMany({
        where: { employee: employeeId }, 
      }),
    ]);

    if (!employee) throw new Error('Employee not found');

    // 3. Calculate Scores
    // ✅ FIX 3: Use 'taskStatus' (Renamed Attribute)
    const tasksCompleted = tasks.filter((t) => t.taskStatus === 'completed').length;
    const tasksTotal = tasks.length;
    const taskRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) : 0; 

    // ✅ FIX 4: Use 'attendanceStatus' (Renamed Attribute)
    const daysPresent = attendance.filter((a) => a.attendanceStatus === 'present').length;
    const attendanceTotal = attendance.length;
    const attendanceRate = attendanceTotal > 0 ? (daysPresent / attendanceTotal) : 0; 
    
    const performanceScore = ((taskRate * 0.5) + (attendanceRate * 0.5)) * 100; 
    const productivityScore = ((taskRate * 0.7) + (attendanceRate * 0.3)) * 100; 

    // 4. Save to DB
    // ✅ FIX 5: Use CamelCase keys for data object to match Schema
    const kpiData = {
      employee: employeeId,
      date: today,
      tasksCompleted: tasksCompleted,
      tasksTotal: tasksTotal,
      attendanceRate: parseFloat((attendanceRate * 100).toFixed(2)),
      performanceScore: parseFloat(performanceScore.toFixed(2)),
      productivityScore: parseFloat(productivityScore.toFixed(2)),
      projectsCompleted: 0,
    };
    
    const newKPI = await strapi.db.query('api::employee-kpi.employee-kpi').create({ data: kpiData });
    
    return newKPI;
  },

  /**
   * UC02: Calculate Floor KPI
   */
  async getFloorKPI(floorId) {
    if (USE_DEMO_MODE) return MOCK_DATA.floors[floorId] || { productivityScore: 0 };

    const today = new Date().toISOString().split('T')[0];

    let existingKPI = await strapi.db.query('api::floor-kpi.floor-kpi').findOne({
      where: { floor: floorId, date: today },
    });

    if (existingKPI && !isStale(existingKPI)) return existingKPI;

    // Get Employees on Floor
    const employees = await strapi.db.query('api::employee.employee').findMany({
      where: { floor: floorId },
    });

    if (employees.length === 0) return { message: "No employees on this floor" };

    const employeeKPIs = await Promise.all(
      employees.map((emp) => this.getEmployeeKPI(emp.id))
    );

    const validScores = employeeKPIs.map(k => k.productivityScore).filter(s => !isNaN(s));
    const avgProductivity = validScores.reduce((a, b) => a + b, 0) / (validScores.length || 1);
    
    const kpiData = {
      floor: floorId,
      date: today,
      occupancyRate: 0, 
      productivityScore: parseFloat(avgProductivity.toFixed(2)),
      satisfactionScore: 85.0, 
    };

    const newKPI = await strapi.db.query('api::floor-kpi.floor-kpi').create({ data: kpiData });
    return newKPI;
  },

  /**
   * UC03: Calculate Branch KPI
   */
  async getBranchKPI(branchId) {
    if (USE_DEMO_MODE) return MOCK_DATA.branches[branchId] || { productivityScore: 0 };

    const today = new Date().toISOString().split('T')[0];

    let existingKPI = await strapi.db.query('api::branch-kpi.branch-kpi').findOne({
      where: { branch: branchId, date: today },
    });

    if (existingKPI && !isStale(existingKPI)) return existingKPI;

    const floors = await strapi.db.query('api::floor.floor').findMany({
      where: { branch: branchId },
    });

    if (floors.length === 0) return { message: "No floors in this branch" };

    const floorKPIs = await Promise.all(
      floors.map((floor) => this.getFloorKPI(floor.id))
    );

    const validScores = floorKPIs.map(k => k.productivityScore).filter(s => !isNaN(s));
    const avgProductivity = validScores.reduce((a, b) => a + b, 0) / (validScores.length || 1);
    
    // ✅ FIX 6: Use 'performanceRating' (CamelCase) and lowercase enum value
    const rating = avgProductivity > 80 ? 'excellent' : 'good';

    const kpiData = {
      branch: branchId,
      date: today,
      revenue: 150000, // Placeholder
      productivityScore: parseFloat(avgProductivity.toFixed(2)),
      satisfactionScore: 80.0,
      growthRate: 5.0,
      performanceRating: rating
    };

    const newKPI = await strapi.db.query('api::branch-kpi.branch-kpi').create({ data: kpiData });
    return newKPI;
  }
});