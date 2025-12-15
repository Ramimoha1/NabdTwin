/**
 * Alerts API Service
 * 
 * Service for managing alerts and alert rules through the backend API
 */

import { api } from './api';

/**
 * Fetch all currently active (unresolved) alerts
 * 
 * GET /api/alerts/active
 */
export const getActiveAlerts = async () => {
  try {
    const response = await api.get('/api/alerts/active');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    throw error;
  }
};

/**
 * Dismiss/resolve an alert by documentId
 * 
 * DELETE /api/alerts/dismiss/:documentId
 * 
 * @param alertId - The documentId of the alert to dismiss
 */
export const dismissAlert = async (alertId: string) => {
  try {
    const response = await api.delete(`/api/alerts/dismiss/${alertId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error dismissing alert ${alertId}:`, error);
    throw error;
  }
};

/**
 * Fetch all alert rules (for management)
 * 
 * GET /api/alert-rules
 */
export const getAlertRules = async () => {
  try {
    const response = await api.get('/api/alert-rules', {
      params: {
        pagination: { limit: 100 },
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    throw error;
  }
};

/**
 * Create a new alert rule
 * 
 * POST /api/alert-rules
 * 
 * @param ruleData - The alert rule configuration
 */
export const createAlertRule = async (ruleData: {
  kpiName: string;
  threshold: number;
  operator: 'less_than' | 'greater_than' | 'equals';
  alertType: 'warning' | 'critical';
  evaluationPeriod: 'daily' | 'weekly' | 'monthly';
  enabled?: boolean;
  branch?: number;
}) => {
  try {
    const response = await api.post('/api/alert-rules', {
      data: ruleData,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating alert rule:', error);
    if (error.response?.data?.error?.details?.errors) {
      const errors = error.response.data.error.details.errors;
      errors.forEach((err: any) => {
        console.error(`Field: ${err.path?.join('.')}, Message: ${err.message}`);
      });
    }
    if (error.response?.data?.error?.message) {
      console.error('Error message:', error.response.data.error.message);
    }
    throw error;
  }
};

/**
 * Update an alert rule
 * 
 * PUT /api/alert-rules/:documentId
 * 
 * @param ruleId - The documentId of the rule to update
 * @param ruleData - The updated alert rule configuration
 */
export const updateAlertRule = async (
  ruleId: string,
  ruleData: {
    kpiName?: string;
    threshold?: number;
    operator?: 'less_than' | 'greater_than' | 'equals';
    alertType?: 'warning' | 'critical';
    evaluationPeriod?: 'daily' | 'weekly' | 'monthly';
    enabled?: boolean;
    branch?: number;
  }
) => {
  try {
    const response = await api.put(`/api/alert-rules/${ruleId}`, {
      data: ruleData,
    });
    return response.data.data;
  } catch (error: any) {
    console.error(`Error updating alert rule ${ruleId}:`, error);
    if (error.response?.data?.error?.details?.errors) {
      const errors = error.response.data.error.details.errors;
      errors.forEach((err: any) => {
        console.error(`Field: ${err.path?.join('.')}, Message: ${err.message}`);
      });
    }
    throw error;
  }
};

/**
 * Delete an alert rule
 * 
 * DELETE /api/alert-rules/:documentId
 * 
 * @param ruleId - The documentId of the rule to delete
 */
export const deleteAlertRule = async (ruleId: string) => {
  try {
    const response = await api.delete(`/api/alert-rules/${ruleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting alert rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Fetch alert history with optional filters
 * 
 * GET /api/alerts?sort=createdAt:desc
 * 
 * @param filters - Optional filter parameters (severity, dateRange, etc.)
 */
export const getAlertHistory = async (filters?: {
  severity?: 'warning' | 'critical';
  isResolved?: boolean;
  branch?: number;
  department?: number;
  team?: number;
  employee?: number;
}) => {
  try {
    const params = {
      filters: {
        ...filters,
      },
      sort: 'createdAt:desc',
      pagination: {
        limit: 100,
      },
      populate: {
        organization: true,
        branch: true,
        department: true,
        team: true,
        employee: true,
        triggeredByRule: true,
        resolvedBy: true,
      },
    };

    const response = await api.get('/api/alerts', { params });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching alert history:', error);
    throw error;
  }
};

/**
 * Trigger manual alert rule evaluation
 * 
 * POST /api/alerts/evaluate-rules
 * 
 * This endpoint can be called to manually trigger the alert evaluation
 * process instead of waiting for the cron job.
 */
export const evaluateAlertRules = async () => {
  try {
    const response = await api.post('/api/alerts/evaluate-rules', {});
    return response.data;
  } catch (error) {
    console.error('Error evaluating alert rules:', error);
    throw error;
  }
};

export default {
  getActiveAlerts,
  dismissAlert,
  getAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  getAlertHistory,
  evaluateAlertRules,
};
