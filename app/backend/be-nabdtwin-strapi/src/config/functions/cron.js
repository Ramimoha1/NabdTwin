/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [second (optional)] [minute] [hour] [day of month] [month] [day of week]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations/required/cron.html
 */

module.exports = {
  /**
   * Alert Rule Evaluation Job
   * Runs every hour at the start of the hour (00 minutes)
   * Evaluates all enabled alert rules and creates alerts for breached thresholds
   */
  evaluateAlertRules: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info('[CRON] Starting alert rule evaluation job...');
        
        const alertService = strapi.service('api::alert.alert-evaluation');
        await alertService.evaluateAllRules();
        
        strapi.log.info('[CRON] Alert rule evaluation job completed successfully');
      } catch (error) {
        strapi.log.error('[CRON] Alert rule evaluation job failed:', error);
      }
    },
    options: '0 * * * *', // Runs at the start of every hour
  },
};
