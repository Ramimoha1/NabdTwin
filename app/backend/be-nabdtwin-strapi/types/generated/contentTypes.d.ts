import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminAuditLog extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_audit_logs';
  info: {
    displayName: 'Audit Log';
    pluralName: 'audit-logs';
    singularName: 'audit-log';
  };
  options: {
    draftAndPublish: false;
    timestamps: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::audit-log'> &
      Schema.Attribute.Private;
    payload: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<'oneToOne', 'admin::user'>;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAdvisoryLogAdvisoryLog extends Struct.CollectionTypeSchema {
  collectionName: 'advisory_logs';
  info: {
    displayName: 'Advisory Log';
    pluralName: 'advisory-logs';
    singularName: 'advisory-log';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    ai_response: Schema.Attribute.Text;
    context_target: Schema.Attribute.String;
    context_type: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::advisory-log.advisory-log'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    timestamp: Schema.Attribute.DateTime;
    token_usage: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiAlertRuleAlertRule extends Struct.CollectionTypeSchema {
  collectionName: 'alert_rules';
  info: {
    description: 'Configuration for automated KPI threshold monitoring and alerting.';
    displayName: 'Alert Rule Configuration';
    pluralName: 'alert-rules';
    singularName: 'alert-rule';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    activeAlerts: Schema.Attribute.Relation<'oneToMany', 'api::alert.alert'>;
    alertType: Schema.Attribute.Enumeration<['warning', 'critical']> &
      Schema.Attribute.Required;
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    evaluationPeriod: Schema.Attribute.Enumeration<
      ['daily', 'weekly', 'monthly']
    > &
      Schema.Attribute.Required;
    kpiName: Schema.Attribute.Enumeration<
      [
        'Productivity',
        'Growth Rate',
        'Employee Joins',
        'Employee Resignations',
        'On-Time Delivery',
        'Late Tasks',
      ]
    > &
      Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::alert-rule.alert-rule'
    > &
      Schema.Attribute.Private;
    operator: Schema.Attribute.Enumeration<
      ['less_than', 'greater_than', 'equals']
    > &
      Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    threshold: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAlertAlert extends Struct.CollectionTypeSchema {
  collectionName: 'alerts';
  info: {
    description: 'Log of KPI threshold breaches that require managerial attention.';
    displayName: 'Active Alert Event';
    pluralName: 'alerts';
    singularName: 'alert';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    category: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currentValue: Schema.Attribute.Decimal;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    description: Schema.Attribute.Text;
    employee: Schema.Attribute.Relation<'manyToOne', 'api::employee.employee'>;
    isResolved: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    kpiName: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::alert.alert'> &
      Schema.Attribute.Private;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    publishedAt: Schema.Attribute.DateTime;
    resolvedAt: Schema.Attribute.DateTime;
    resolvedBy: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    severity: Schema.Attribute.Enumeration<['critical', 'warning', 'info']>;
    team: Schema.Attribute.Relation<'manyToOne', 'api::team.team'>;
    threshold: Schema.Attribute.Decimal;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    triggeredByRule: Schema.Attribute.Relation<
      'oneToOne',
      'api::alert-rule.alert-rule'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userAlertStatuses: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-alert-status.user-alert-status'
    >;
  };
}

export interface ApiAppFeatureAppFeature extends Struct.CollectionTypeSchema {
  collectionName: 'app_features';
  info: {
    description: 'Application feature/permission entity';
    displayName: 'App Feature';
    pluralName: 'app-features';
    singularName: 'app-feature';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    category: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::app-feature.app-feature'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userFeaturePermissions: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-feature-permission.user-feature-permission'
    >;
  };
}

export interface ApiAttendanceRecordAttendanceRecord
  extends Struct.CollectionTypeSchema {
  collectionName: 'attendance_records';
  info: {
    description: 'Employee attendance record';
    displayName: 'Attendance Record';
    pluralName: 'attendance-records';
    singularName: 'attendance-record';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attendanceStatus: Schema.Attribute.Enumeration<
      ['present', 'absent', 'late', 'on-leave', 'sick-leave', 'holiday']
    >;
    checkInTime: Schema.Attribute.DateTime;
    checkOutTime: Schema.Attribute.DateTime;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    employee: Schema.Attribute.Relation<'manyToOne', 'api::employee.employee'>;
    hoursWorked: Schema.Attribute.Decimal;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::attendance-record.attendance-record'
    > &
      Schema.Attribute.Private;
    notes: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAuditLogAuditLog extends Struct.CollectionTypeSchema {
  collectionName: 'audit_logs';
  info: {
    description: 'System audit log entity';
    displayName: 'Audit Log';
    pluralName: 'audit-logs';
    singularName: 'audit-log';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entityId: Schema.Attribute.String;
    entityType: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    ipAddress: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::audit-log.audit-log'
    > &
      Schema.Attribute.Private;
    newValues: Schema.Attribute.JSON;
    oldValues: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    userAgent: Schema.Attribute.Text;
  };
}

export interface ApiBranchFinancialBranchFinancial
  extends Struct.CollectionTypeSchema {
  collectionName: 'branch_financials';
  info: {
    displayName: 'Branch Financials';
    pluralName: 'branch-financials';
    singularName: 'branch-financial';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    expenses: Schema.Attribute.Decimal;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::branch-financial.branch-financial'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    revenue: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBranchKpiBranchKpi extends Struct.CollectionTypeSchema {
  collectionName: 'branch_kpis';
  info: {
    description: 'Branch KPI time-series data';
    displayName: 'Branch KPI';
    pluralName: 'branch-kpis';
    singularName: 'branch-kpi';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    employeeCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    growthRate: Schema.Attribute.Decimal;
    joinedCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    leftCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::branch-kpi.branch-kpi'
    > &
      Schema.Attribute.Private;
    overdueTaskCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    performanceRating: Schema.Attribute.Enumeration<
      ['excellent', 'good', 'average', 'poor']
    >;
    productivityScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    revenue: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    revenueTarget: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    satisfactionScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBranchBranch extends Struct.CollectionTypeSchema {
  collectionName: 'branches';
  info: {
    description: 'Branch/Location entity';
    displayName: 'Branch';
    pluralName: 'branches';
    singularName: 'branch';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    address: Schema.Attribute.Text & Schema.Attribute.Required;
    alertRules: Schema.Attribute.Relation<
      'oneToMany',
      'api::alert-rule.alert-rule'
    >;
    alerts: Schema.Attribute.Relation<'oneToMany', 'api::alert.alert'>;
    branchKpis: Schema.Attribute.Relation<
      'oneToMany',
      'api::branch-kpi.branch-kpi'
    >;
    branchStatus: Schema.Attribute.Enumeration<
      ['active', 'inactive', 'maintenance']
    > &
      Schema.Attribute.DefaultTo<'active'>;
    city: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    code: Schema.Attribute.String &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    country: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    customerSurveys: Schema.Attribute.Relation<
      'oneToMany',
      'api::satisfaction-survey.satisfaction-survey'
    >;
    departments: Schema.Attribute.Relation<
      'oneToMany',
      'api::department.department'
    >;
    employees: Schema.Attribute.Relation<'oneToMany', 'api::employee.employee'>;
    financials: Schema.Attribute.Relation<
      'oneToMany',
      'api::branch-financial.branch-financial'
    >;
    floors: Schema.Attribute.Relation<'oneToMany', 'api::floor.floor'>;
    insights: Schema.Attribute.Relation<'oneToMany', 'api::insight.insight'>;
    latitude: Schema.Attribute.Decimal;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::branch.branch'
    > &
      Schema.Attribute.Private;
    longitude: Schema.Attribute.Decimal;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    postalCode: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    reports: Schema.Attribute.Relation<'oneToMany', 'api::report.report'>;
    revenueTarget: Schema.Attribute.Decimal;
    teams: Schema.Attribute.Relation<'oneToMany', 'api::team.team'>;
    totalEmployees: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    totalFloors: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userBranchPermissions: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-branch-permission.user-branch-permission'
    >;
  };
}

export interface ApiDashboardDashboard extends Struct.CollectionTypeSchema {
  collectionName: 'dashboards';
  info: {
    description: 'User dashboard configuration';
    displayName: 'Dashboard';
    pluralName: 'dashboards';
    singularName: 'dashboard';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    isDefault: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    layout: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::dashboard.dashboard'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiDepartmentKpiDepartmentKpi
  extends Struct.CollectionTypeSchema {
  collectionName: 'department_kpis';
  info: {
    description: 'Department KPI time-series data';
    displayName: 'Department KPI';
    pluralName: 'department-kpis';
    singularName: 'department-kpi';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    efficiencyScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    employeeCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::department-kpi.department-kpi'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    revenue: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    revenueTarget: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    satisfactionScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    tasksCompleted: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    tasksTotal: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    teamCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiDepartmentDepartment extends Struct.CollectionTypeSchema {
  collectionName: 'departments';
  info: {
    description: 'Department entity';
    displayName: 'Department';
    pluralName: 'departments';
    singularName: 'department';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    alerts: Schema.Attribute.Relation<'oneToMany', 'api::alert.alert'>;
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    code: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    departmentKpis: Schema.Attribute.Relation<
      'oneToMany',
      'api::department-kpi.department-kpi'
    >;
    description: Schema.Attribute.Text;
    employees: Schema.Attribute.Relation<'oneToMany', 'api::employee.employee'>;
    headEmployee: Schema.Attribute.Relation<
      'oneToOne',
      'api::employee.employee'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::department.department'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    parentDepartment: Schema.Attribute.Relation<
      'oneToOne',
      'api::department.department'
    >;
    projects: Schema.Attribute.Relation<'oneToMany', 'api::project.project'>;
    publishedAt: Schema.Attribute.DateTime;
    reports: Schema.Attribute.Relation<'oneToMany', 'api::report.report'>;
    teams: Schema.Attribute.Relation<'oneToMany', 'api::team.team'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEmployeeKpiEmployeeKpi extends Struct.CollectionTypeSchema {
  collectionName: 'employee_kpis';
  info: {
    description: 'Employee KPI time-series data';
    displayName: 'Employee KPI';
    pluralName: 'employee-kpis';
    singularName: 'employee-kpi';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attendanceRate: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    employee: Schema.Attribute.Relation<'manyToOne', 'api::employee.employee'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::employee-kpi.employee-kpi'
    > &
      Schema.Attribute.Private;
    performanceScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    productivityScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    projectsCompleted: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    tasksCompleted: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    tasksTotal: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEmployeeSkillEmployeeSkill
  extends Struct.CollectionTypeSchema {
  collectionName: 'employee_skills';
  info: {
    description: 'Employee skill relationship with proficiency';
    displayName: 'Employee Skill';
    pluralName: 'employee-skills';
    singularName: 'employee-skill';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    employee: Schema.Attribute.Relation<'manyToOne', 'api::employee.employee'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::employee-skill.employee-skill'
    > &
      Schema.Attribute.Private;
    proficiencyLevel: Schema.Attribute.Enumeration<
      ['beginner', 'intermediate', 'advanced', 'expert']
    >;
    publishedAt: Schema.Attribute.DateTime;
    skill: Schema.Attribute.Relation<'manyToOne', 'api::skill.skill'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    yearsOfExperience: Schema.Attribute.Decimal;
  };
}

export interface ApiEmployeeEmployee extends Struct.CollectionTypeSchema {
  collectionName: 'employees';
  info: {
    description: 'Employee entity';
    displayName: 'Employee';
    pluralName: 'employees';
    singularName: 'employee';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    alerts: Schema.Attribute.Relation<'oneToMany', 'api::alert.alert'>;
    assignedTasks: Schema.Attribute.Relation<'oneToMany', 'api::task.task'>;
    attendanceRecords: Schema.Attribute.Relation<
      'oneToMany',
      'api::attendance-record.attendance-record'
    >;
    avatarUrl: Schema.Attribute.Text;
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    createdProjects: Schema.Attribute.Relation<
      'oneToMany',
      'api::project.project'
    >;
    currency: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 3;
      }> &
      Schema.Attribute.DefaultTo<'SAR'>;
    dateOfBirth: Schema.Attribute.Date;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    employeeKpis: Schema.Attribute.Relation<
      'oneToMany',
      'api::employee-kpi.employee-kpi'
    >;
    employeeNumber: Schema.Attribute.String &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    employeeSkills: Schema.Attribute.Relation<
      'oneToMany',
      'api::employee-skill.employee-skill'
    >;
    employmentStatus: Schema.Attribute.Enumeration<
      ['active', 'inactive', 'on-leave', 'terminated']
    > &
      Schema.Attribute.DefaultTo<'active'>;
    employmentType: Schema.Attribute.Enumeration<
      ['full-time', 'part-time', 'contract', 'intern']
    >;
    firstName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    floor: Schema.Attribute.Relation<'manyToOne', 'api::floor.floor'>;
    gender: Schema.Attribute.Enumeration<
      ['male', 'female', 'other', 'prefer_not_to_say']
    >;
    hireDate: Schema.Attribute.Date;
    jobTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    lastName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::employee.employee'
    > &
      Schema.Attribute.Private;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    phone: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    positionX: Schema.Attribute.Decimal;
    positionY: Schema.Attribute.Decimal;
    positionZ: Schema.Attribute.Decimal;
    publishedAt: Schema.Attribute.DateTime;
    reports: Schema.Attribute.Relation<'oneToMany', 'api::report.report'>;
    salary: Schema.Attribute.Decimal;
    supervisor: Schema.Attribute.Relation<'oneToOne', 'api::employee.employee'>;
    tasksInProgress: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    tasksOverdue: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    team: Schema.Attribute.Relation<'manyToOne', 'api::team.team'>;
    terminationDate: Schema.Attribute.Date;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    workspace: Schema.Attribute.Relation<
      'manyToOne',
      'api::workspace.workspace'
    >;
  };
}

export interface ApiFloorKpiFloorKpi extends Struct.CollectionTypeSchema {
  collectionName: 'floor_kpis';
  info: {
    description: 'Floor KPI time-series data';
    displayName: 'Floor KPI';
    pluralName: 'floor-kpis';
    singularName: 'floor-kpi';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    floor: Schema.Attribute.Relation<'manyToOne', 'api::floor.floor'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::floor-kpi.floor-kpi'
    > &
      Schema.Attribute.Private;
    occupancyRate: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    productivityScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFloorFloor extends Struct.CollectionTypeSchema {
  collectionName: 'floors';
  info: {
    description: 'Floor entity';
    displayName: 'Floor';
    pluralName: 'floors';
    singularName: 'floor';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    employees: Schema.Attribute.Relation<'oneToMany', 'api::employee.employee'>;
    floorKpis: Schema.Attribute.Relation<
      'oneToMany',
      'api::floor-kpi.floor-kpi'
    >;
    floorNumber: Schema.Attribute.Integer & Schema.Attribute.Required;
    floorPlanUrl: Schema.Attribute.Text;
    floors: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::floor.floor'> &
      Schema.Attribute.Private;
    model3dUrl: Schema.Attribute.Text;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    totalArea: Schema.Attribute.Decimal;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workspaces: Schema.Attribute.Relation<
      'oneToMany',
      'api::workspace.workspace'
    >;
  };
}

export interface ApiInsightInsight extends Struct.CollectionTypeSchema {
  collectionName: 'insights';
  info: {
    description: 'Analytics insight entity';
    displayName: 'Insight';
    pluralName: 'insights';
    singularName: 'insight';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    data: Schema.Attribute.JSON;
    description: Schema.Attribute.Text;
    insightType: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::insight.insight'
    > &
      Schema.Attribute.Private;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    publishedAt: Schema.Attribute.DateTime;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiOrganizationOrganization
  extends Struct.CollectionTypeSchema {
  collectionName: 'organizations';
  info: {
    description: 'Main organization entity';
    displayName: 'Organization';
    pluralName: 'organizations';
    singularName: 'organization';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    alerts: Schema.Attribute.Relation<'oneToMany', 'api::alert.alert'>;
    branches: Schema.Attribute.Relation<'oneToMany', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    departments: Schema.Attribute.Relation<
      'oneToMany',
      'api::department.department'
    >;
    description: Schema.Attribute.Text;
    employees: Schema.Attribute.Relation<'oneToMany', 'api::employee.employee'>;
    industry: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    insights: Schema.Attribute.Relation<'oneToMany', 'api::insight.insight'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::organization.organization'
    > &
      Schema.Attribute.Private;
    logoUrl: Schema.Attribute.Text;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    projects: Schema.Attribute.Relation<'oneToMany', 'api::project.project'>;
    publishedAt: Schema.Attribute.DateTime;
    reports: Schema.Attribute.Relation<'oneToMany', 'api::report.report'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProjectProject extends Struct.CollectionTypeSchema {
  collectionName: 'projects';
  info: {
    description: 'Project entity';
    displayName: 'Project';
    pluralName: 'projects';
    singularName: 'project';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actualCost: Schema.Attribute.Decimal;
    budget: Schema.Attribute.Decimal;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    description: Schema.Attribute.Text;
    endDate: Schema.Attribute.Date;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::project.project'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    priority: Schema.Attribute.Enumeration<
      ['low', 'medium', 'high', 'critical']
    >;
    progressPercentage: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    projectStatus: Schema.Attribute.Enumeration<
      ['planning', 'active', 'on-hold', 'completed', 'cancelled']
    >;
    publishedAt: Schema.Attribute.DateTime;
    startDate: Schema.Attribute.Date;
    tasks: Schema.Attribute.Relation<'oneToMany', 'api::task.task'>;
    team: Schema.Attribute.Relation<'manyToOne', 'api::team.team'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiReportReport extends Struct.CollectionTypeSchema {
  collectionName: 'reports';
  info: {
    description: 'Report entity';
    displayName: 'Report';
    pluralName: 'reports';
    singularName: 'report';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dateFrom: Schema.Attribute.Date;
    dateTo: Schema.Attribute.Date;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    description: Schema.Attribute.Text;
    employee: Schema.Attribute.Relation<'manyToOne', 'api::employee.employee'>;
    fileUrl: Schema.Attribute.Text;
    generatedBy: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::report.report'
    > &
      Schema.Attribute.Private;
    organization: Schema.Attribute.Relation<
      'manyToOne',
      'api::organization.organization'
    >;
    publishedAt: Schema.Attribute.DateTime;
    reportData: Schema.Attribute.JSON;
    reportType: Schema.Attribute.Enumeration<
      ['performance', 'attendance', 'project', 'kpi', 'financial', 'custom']
    >;
    scope: Schema.Attribute.Enumeration<
      ['organization', 'branch', 'department', 'team', 'employee']
    >;
    team: Schema.Attribute.Relation<'manyToOne', 'api::team.team'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSatisfactionSurveySatisfactionSurvey
  extends Struct.CollectionTypeSchema {
  collectionName: 'satisfaction_surveys';
  info: {
    displayName: 'Satisfaction Survey';
    pluralName: 'satisfaction-surveys';
    singularName: 'satisfaction-survey';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    feedback: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::satisfaction-survey.satisfaction-survey'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    score: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSkillSkill extends Struct.CollectionTypeSchema {
  collectionName: 'skills';
  info: {
    description: 'Skill entity';
    displayName: 'Skill';
    pluralName: 'skills';
    singularName: 'skill';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    category: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    employeeSkills: Schema.Attribute.Relation<
      'oneToMany',
      'api::employee-skill.employee-skill'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::skill.skill'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTaskTask extends Struct.CollectionTypeSchema {
  collectionName: 'tasks';
  info: {
    description: 'Task entity';
    displayName: 'Task';
    pluralName: 'tasks';
    singularName: 'task';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actualHours: Schema.Attribute.Decimal;
    assignedTo: Schema.Attribute.Relation<
      'manyToOne',
      'api::employee.employee'
    >;
    completedDate: Schema.Attribute.Date;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    dueDate: Schema.Attribute.Date;
    estimatedHours: Schema.Attribute.Decimal;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::task.task'> &
      Schema.Attribute.Private;
    priority: Schema.Attribute.Enumeration<
      ['low', 'medium', 'high', 'critical']
    >;
    project: Schema.Attribute.Relation<'manyToOne', 'api::project.project'>;
    publishedAt: Schema.Attribute.DateTime;
    taskStatus: Schema.Attribute.Enumeration<
      ['todo', 'in-progress', 'review', 'completed', 'cancelled']
    > &
      Schema.Attribute.DefaultTo<'todo'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTeamKpiTeamKpi extends Struct.CollectionTypeSchema {
  collectionName: 'team_kpis';
  info: {
    description: 'Team KPI time-series data';
    displayName: 'Team KPI';
    pluralName: 'team-kpis';
    singularName: 'team-kpi';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    avgPerformanceScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::team-kpi.team-kpi'
    > &
      Schema.Attribute.Private;
    productivityScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    tasksCompleted: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    tasksTotal: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    team: Schema.Attribute.Relation<'manyToOne', 'api::team.team'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTeamTeam extends Struct.CollectionTypeSchema {
  collectionName: 'teams';
  info: {
    description: 'Team entity';
    displayName: 'Team';
    pluralName: 'teams';
    singularName: 'team';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    alerts: Schema.Attribute.Relation<'oneToMany', 'api::alert.alert'>;
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    department: Schema.Attribute.Relation<
      'manyToOne',
      'api::department.department'
    >;
    description: Schema.Attribute.Text;
    employees: Schema.Attribute.Relation<'oneToMany', 'api::employee.employee'>;
    leaderEmployee: Schema.Attribute.Relation<
      'oneToOne',
      'api::employee.employee'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::team.team'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    projects: Schema.Attribute.Relation<'oneToMany', 'api::project.project'>;
    publishedAt: Schema.Attribute.DateTime;
    reports: Schema.Attribute.Relation<'oneToMany', 'api::report.report'>;
    teamKpis: Schema.Attribute.Relation<'oneToMany', 'api::team-kpi.team-kpi'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiUserAlertStatusUserAlertStatus
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_alert_statuses';
  info: {
    description: 'User alert read status';
    displayName: 'User Alert Status';
    pluralName: 'user-alert-statuses';
    singularName: 'user-alert-status';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    alert: Schema.Attribute.Relation<'manyToOne', 'api::alert.alert'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isRead: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-alert-status.user-alert-status'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    readAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserBranchPermissionUserBranchPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_branch_permissions';
  info: {
    description: 'User branch access permission';
    displayName: 'User Branch Permission';
    pluralName: 'user-branch-permissions';
    singularName: 'user-branch-permission';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    branch: Schema.Attribute.Relation<'manyToOne', 'api::branch.branch'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    grantedAt: Schema.Attribute.DateTime;
    grantedBy: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-branch-permission.user-branch-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserFeaturePermissionUserFeaturePermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_feature_permissions';
  info: {
    description: 'User feature access permission';
    displayName: 'User Feature Permission';
    pluralName: 'user-feature-permissions';
    singularName: 'user-feature-permission';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    appFeature: Schema.Attribute.Relation<
      'manyToOne',
      'api::app-feature.app-feature'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    grantedAt: Schema.Attribute.DateTime;
    grantedBy: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-feature-permission.user-feature-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiWorkspaceKpiWorkspaceKpi
  extends Struct.CollectionTypeSchema {
  collectionName: 'workspace_kpis';
  info: {
    description: 'Workspace KPI time-series data';
    displayName: 'Workspace KPI';
    pluralName: 'workspace-kpis';
    singularName: 'workspace-kpi';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    collaborationScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::workspace-kpi.workspace-kpi'
    > &
      Schema.Attribute.Private;
    productivityScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    utilizationRate: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    workspace: Schema.Attribute.Relation<
      'manyToOne',
      'api::workspace.workspace'
    >;
  };
}

export interface ApiWorkspaceWorkspace extends Struct.CollectionTypeSchema {
  collectionName: 'workspaces';
  info: {
    description: 'Workspace/Office entity';
    displayName: 'Workspace';
    pluralName: 'workspaces';
    singularName: 'workspace';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    area: Schema.Attribute.Decimal;
    capacity: Schema.Attribute.Integer;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    employees: Schema.Attribute.Relation<'oneToMany', 'api::employee.employee'>;
    floor: Schema.Attribute.Relation<'manyToOne', 'api::floor.floor'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::workspace.workspace'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    positionX: Schema.Attribute.Decimal;
    positionY: Schema.Attribute.Decimal;
    positionZ: Schema.Attribute.Decimal;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workspaceKpis: Schema.Attribute.Relation<
      'oneToMany',
      'api::workspace-kpi.workspace-kpi'
    >;
    workspaceType: Schema.Attribute.Enumeration<
      ['office', 'meeting', 'open-space', 'lab', 'cafeteria', 'recreation']
    >;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    advisory_logs: Schema.Attribute.Relation<
      'oneToMany',
      'api::advisory-log.advisory-log'
    >;
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dashboards: Schema.Attribute.Relation<
      'oneToMany',
      'api::dashboard.dashboard'
    >;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    employee: Schema.Attribute.Relation<'oneToOne', 'api::employee.employee'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordExpires: Schema.Attribute.DateTime & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    type: Schema.Attribute.Enumeration<['admin', 'normal']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'normal'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userAlertStatuses: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-alert-status.user-alert-status'
    >;
    userBranchPermissions: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-branch-permission.user-branch-permission'
    >;
    userFeaturePermissions: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-feature-permission.user-feature-permission'
    >;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::audit-log': AdminAuditLog;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::advisory-log.advisory-log': ApiAdvisoryLogAdvisoryLog;
      'api::alert-rule.alert-rule': ApiAlertRuleAlertRule;
      'api::alert.alert': ApiAlertAlert;
      'api::app-feature.app-feature': ApiAppFeatureAppFeature;
      'api::attendance-record.attendance-record': ApiAttendanceRecordAttendanceRecord;
      'api::audit-log.audit-log': ApiAuditLogAuditLog;
      'api::branch-financial.branch-financial': ApiBranchFinancialBranchFinancial;
      'api::branch-kpi.branch-kpi': ApiBranchKpiBranchKpi;
      'api::branch.branch': ApiBranchBranch;
      'api::dashboard.dashboard': ApiDashboardDashboard;
      'api::department-kpi.department-kpi': ApiDepartmentKpiDepartmentKpi;
      'api::department.department': ApiDepartmentDepartment;
      'api::employee-kpi.employee-kpi': ApiEmployeeKpiEmployeeKpi;
      'api::employee-skill.employee-skill': ApiEmployeeSkillEmployeeSkill;
      'api::employee.employee': ApiEmployeeEmployee;
      'api::floor-kpi.floor-kpi': ApiFloorKpiFloorKpi;
      'api::floor.floor': ApiFloorFloor;
      'api::insight.insight': ApiInsightInsight;
      'api::organization.organization': ApiOrganizationOrganization;
      'api::project.project': ApiProjectProject;
      'api::report.report': ApiReportReport;
      'api::satisfaction-survey.satisfaction-survey': ApiSatisfactionSurveySatisfactionSurvey;
      'api::skill.skill': ApiSkillSkill;
      'api::task.task': ApiTaskTask;
      'api::team-kpi.team-kpi': ApiTeamKpiTeamKpi;
      'api::team.team': ApiTeamTeam;
      'api::user-alert-status.user-alert-status': ApiUserAlertStatusUserAlertStatus;
      'api::user-branch-permission.user-branch-permission': ApiUserBranchPermissionUserBranchPermission;
      'api::user-feature-permission.user-feature-permission': ApiUserFeaturePermissionUserFeaturePermission;
      'api::workspace-kpi.workspace-kpi': ApiWorkspaceKpiWorkspaceKpi;
      'api::workspace.workspace': ApiWorkspaceWorkspace;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
