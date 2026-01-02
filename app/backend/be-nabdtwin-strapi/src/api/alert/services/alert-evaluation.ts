

import { factories } from '@strapi/strapi';

type AlertComparisonOperator = 'less_than' | 'greater_than' | 'equals';

interface AlertRuleData {
  id: number;
  kpiName: string;
  threshold: number;
  operator: AlertComparisonOperator;
  alertType: 'warning' | 'critical';
  evaluationPeriod: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  branch?: {
    id: number;
  };
}

interface KPIValue {
  value: number;
  timestamp: string;
}

/**
 * Fetch all currently unresolved alerts
 * Used by the frontend to display the active alerts list
 */
const getActiveAlerts = async () => {
  try {
    const alerts = await strapi.entityService.findMany('api::alert.alert', {
      filters: {
        isResolved: false,
      },
      populate: {
        organization: true,
        branch: true,
        department: true,
        team: true,
        employee: true,
        triggeredByRule: true,
        resolvedBy: true,
        userAlertStatuses: true,
      },
      sort: { createdAt: 'desc' },
    });

    return alerts;
  } catch (error) {
    strapi.log.error('Error fetching active alerts:', error);
    throw new Error('Failed to fetch active alerts');
  }
};

/**
 * Mark an alert as resolved/dismissed
 * 
 * @param alertId - The ID of the alert to resolve
 * @param userId - The ID of the user resolving the alert
 */
const resolveAlert = async (alertId: number, userId: number) => {
  try {
    const alert = await strapi.entityService.update(
      'api::alert.alert',
      alertId,
      {
        data: {
          isResolved: true,
          resolvedAt: new Date().toISOString(),
          resolvedBy: userId,
        },
        populate: {
          organization: true,
          branch: true,
          department: true,
          team: true,
          employee: true,
          triggeredByRule: true,
          resolvedBy: true,
          userAlertStatuses: true,
        },
      }
    );

    return alert;
  } catch (error) {
    strapi.log.error(`Error resolving alert ${alertId}:`, error);
    throw new Error(`Failed to resolve alert ${alertId}`);
  }
};

/**
 * Compare KPI value against threshold using the specified operator
 * 
 * @param currentValue - Current KPI value
 * @param threshold - Threshold value from the rule
 * @param operator - Comparison operator
 */
const checkThresholdBreach = (
  currentValue: number,
  threshold: number,
  operator: AlertComparisonOperator
): boolean => {
  switch (operator) {
    case 'less_than':
      return currentValue < threshold;
    case 'greater_than':
      return currentValue > threshold;
    case 'equals':
      return currentValue === threshold;
    default:
      return false;
  }
};

/**
 * Get KPI value from the database
 * 
 * Retrieves the most recent KPI value for a given metric from the appropriate
 * collection type based on the context (branch, department, team, or employee).
 * 
 * @param kpiName - Name of the KPI to retrieve (e.g., "Productivity", "On-Time Delivery")
 * @param context - Context information (branch, department, team, employee)
 * @returns KPI value object with value and timestamp, or null if not found
 */
const getKPIValue = async (
  kpiName: string,
  context: {
    branchId?: number;
    departmentId?: number;
    teamId?: number;
    employeeId?: number;
  }
): Promise<KPIValue | null> => {
  try {
    let kpiRecord = null;

    // Determine which KPI table to query based on context hierarchy
    // Priority: employee > team > department > branch > workspace
    
    if (context.employeeId) {
      // Fetch employee-level KPI
      kpiRecord = await strapi.entityService.findMany('api::employee-kpi.employee-kpi', {
        filters: {
          employee: { id: context.employeeId },
          kpiName: kpiName,
        },
        sort: { createdAt: 'desc' },
        limit: 1,
      });
    } else if (context.teamId) {
      // Fetch team-level KPI
      kpiRecord = await strapi.entityService.findMany('api::team-kpi.team-kpi', {
        filters: {
          team: { id: context.teamId },
          kpiName: kpiName,
        },
        sort: { createdAt: 'desc' },
        limit: 1,
      });
    } else if (context.departmentId) {
      // Fetch department-level KPI
      kpiRecord = await strapi.entityService.findMany('api::department-kpi.department-kpi', {
        filters: {
          department: { id: context.departmentId },
          kpiName: kpiName,
        },
        sort: { createdAt: 'desc' },
        limit: 1,
      });
    } else if (context.branchId) {
      // Fetch branch-level KPI
      kpiRecord = await strapi.entityService.findMany('api::branch-kpi.branch-kpi', {
        filters: {
          branch: { id: context.branchId },
          kpiName: kpiName,
        },
        sort: { createdAt: 'desc' },
        limit: 1,
      });
    } else {
      // Fetch workspace-level KPI (organization-wide)
      // Note: workspace-kpi may not have a kpiName field, so we filter in-memory instead
      const allWorkspaceKpis = await strapi.entityService.findMany('api::workspace-kpi.workspace-kpi', {
        sort: { createdAt: 'desc' },
        limit: 100,
      });
      
      // Filter by kpiName in memory
      kpiRecord = allWorkspaceKpis.filter((kpi: any) => kpi.kpiName === kpiName).slice(0, 1);
    }

    // Extract value from the fetched record
    if (kpiRecord && kpiRecord.length > 0) {
      const record = kpiRecord[0];
      const value = record.value || record.currentValue || 0;
      
      return {
        value: parseFloat(String(value)),
        timestamp: record.createdAt || new Date().toISOString(),
      };
    }

    // If no record found, log warning and return null
    strapi.log.warn(
      `No KPI value found for ${kpiName} in context: branch=${context.branchId}, dept=${context.departmentId}, team=${context.teamId}, emp=${context.employeeId}`
    );
    return null;
  } catch (error) {
    strapi.log.error(`Error retrieving KPI value for ${kpiName}:`, error);
    return null;
  }
};

/**
 * Evaluate all enabled alert rules and create alerts if thresholds are breached
 * 
 * This function performs the automated alert check and should be called by:
 * - A cron job (periodic evaluation)
 * - A webhook (on-demand evaluation)
 * - Manual API calls
 */
const evaluateAllRules = async () => {
  try {
    strapi.log.info('Starting alert rule evaluation...');

    // Fetch all enabled alert rules
    const alertRules = await strapi.entityService.findMany(
      'api::alert-rule.alert-rule',
      {
        filters: {
          enabled: true,
        },
        populate: {
          branch: true,
        },
      }
    ) as AlertRuleData[];

    strapi.log.info(`Found ${alertRules.length} enabled alert rules`);

    // Process each rule
    for (const rule of alertRules) {
      try {
        // Build context for KPI retrieval based on the rule's scope
        const context = {
          branchId: rule.branch?.id,
        };

        // Get current KPI value
        const kpiData = await getKPIValue(rule.kpiName, context);

        if (!kpiData) {
          strapi.log.warn(`Could not retrieve KPI value for rule ${rule.id} (${rule.kpiName})`);
          continue;
        }

        // Check if threshold is breached
        const isBreach = checkThresholdBreach(
          kpiData.value,
          rule.threshold,
          rule.operator
        );

        if (isBreach) {
          strapi.log.info(
            `Alert rule ${rule.id} triggered: ${rule.kpiName} breach detected (value: ${kpiData.value}, threshold: ${rule.threshold})`
          );

          // Check if an alert already exists for this rule to avoid duplicates
          const existingAlert = await strapi.entityService.findMany(
            'api::alert.alert',
            {
              filters: {
                triggeredByRule: { id: rule.id },
                isResolved: false,
              },
              limit: 1,
            }
          );

          if (existingAlert && existingAlert.length > 0) {
            strapi.log.info(`Alert for rule ${rule.id} already exists and is unresolved`);
            continue;
          }

          // Create new alert
          const newAlert = await strapi.entityService.create('api::alert.alert', {
            data: {
              title: `${rule.kpiName} Threshold Breach`,
              description: `The ${rule.kpiName} KPI has fallen ${rule.operator === 'less_than' ? 'below' : rule.operator === 'greater_than' ? 'above' : 'to'} the configured threshold of ${rule.threshold}. Current value: ${kpiData.value}.`,
              severity: rule.alertType === 'critical' ? 'critical' : 'warning',
              category: 'Operational',
              kpiName: rule.kpiName,
              currentValue: kpiData.value,
              threshold: rule.threshold,
              triggeredByRule: rule.id,
              isResolved: false,
              branch: rule.branch?.id || undefined,
            },
          });

          strapi.log.info(`Created new alert ${newAlert.id} for rule ${rule.id}`);
        }
      } catch (ruleError) {
        strapi.log.error(`Error evaluating rule ${rule.id}:`, ruleError);
        // Continue with next rule on error
        continue;
      }
    }

    strapi.log.info('Alert rule evaluation completed');
    return { status: 'success', message: 'Alert evaluation completed' };
  } catch (error) {
    strapi.log.error('Error during alert rule evaluation:', error);
    throw new Error('Failed to evaluate alert rules');
  }
};

export default factories.createCoreService('api::alert.alert', () => ({
  getActiveAlerts,
  resolveAlert,
  evaluateAllRules,
  getKPIValue,
  checkThresholdBreach,
}));
