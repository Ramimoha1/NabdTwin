/**
 * employee controller
 */

import { factories } from '@strapi/strapi';

// Helper function to transform employee detail
function transformEmployeeDetail(employee: any) {
  // Determine latest KPI (sorted by date desc if available)
  const kpis = Array.isArray(employee.employeeKpis) ? employee.employeeKpis : [];
  const latestKpi = kpis
    .slice()
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    role: employee.jobTitle || 'N/A',
    email: employee.email || null,
    phone: employee.phone || null,
    image: employee.avatarUrl || null,
    department: employee.department?.name || 'N/A',
    team: employee.team?.name || 'N/A',
    supervisor: employee.supervisor
      ? `${employee.supervisor.firstName} ${employee.supervisor.lastName}`
      : 'None',
    // Return array of skill names to match frontend mock shape
    skills: (employee.employeeSkills || [])
      .map((es: any) => es?.skill?.name)
      .filter(Boolean),
    // Map KPI fields to frontend shape (using kpis plural as expected by interface)
    kpis: latestKpi
      ? {
          tasksCompleted: latestKpi.tasksCompleted ?? 0,
          tasksTotal: latestKpi.tasksTotal ?? 0,
          attendanceRate: Number(latestKpi.attendanceRate ?? 0),
          performanceScore: Number(latestKpi.performanceScore ?? 0),
          productivityScore: Number(latestKpi.productivityScore ?? 0),
        }
      : {
          tasksCompleted: 0,
          tasksTotal: 0,
          attendanceRate: 0,
          performanceScore: 0,
          productivityScore: 0,
        },
    reportsTo: formatReportType(employee.reports),
    // Map reports to recentReports format expected by frontend
    recentReports: (employee.reports || []).map((report: any) => ({
      id: report.id,
      title: report.title || 'Report',
      date: report.dateFrom || new Date().toISOString(),
      type: report.reportType || 'custom'
    }))
  };
}

// Helper function to format report type
function formatReportType(reports: any) {
  if (!reports || reports.length === 0) return 'None';
  return reports.map((r: any) => r.reportType || 'Unknown').join(', ');
}

export default factories.createCoreController('api::employee.employee', ({ strapi }) => ({
  /**
   * Get detailed employee information by ID
   * Transforms complex Strapi relations into flat frontend-friendly format
   */
  async getDetails(ctx) {
    try {
      const { id } = ctx.params;

      // Fetch employee with all relations populated
      const employee: any = await strapi.entityService.findOne('api::employee.employee', id, {
        populate: {
          department: true,
          team: true,
          supervisor: true,
          employeeSkills: {
            populate: {
              skill: true,
            },
          },
          employeeKpis: {
            sort: ['date:desc'],
          },
          reports: true,
        },
      });

      if (!employee) {
        return ctx.notFound('Employee not found');
      }

      // Transform to frontend DTO format
      const transformed = transformEmployeeDetail(employee);

      return transformed;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get employees by branch ID
   */
  async getByBranch(ctx) {
    try {
      const { branchId } = ctx.params;

      const employees: any = await strapi.entityService.findMany('api::employee.employee', {
        filters: {
          branch: {
            id: branchId,
          },
        },
        populate: {
          department: true,
          team: true,
          supervisor: true,
          employeeSkills: {
            populate: {
              skill: true,
            },
          },
          employeeKpis: {
            sort: ['date:desc'],
          },
          reports: true,
        },
      });

      // Transform all employees
      const transformed = employees.map((emp) => transformEmployeeDetail(emp));

      return transformed;
    } catch (error) {
      ctx.throw(500, error);
    }
  },
}));
