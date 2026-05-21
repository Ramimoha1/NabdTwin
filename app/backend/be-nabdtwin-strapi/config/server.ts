export default ({ env }) => ({
  // Default to localhost:3001 to avoid binding to all interfaces (0.0.0.0)
  // which can cause EACCES on some Windows machines when system services
  // reserve low ports or specific interfaces.
  host: env('HOST', '127.0.0.1'),
  port: env.int('PORT', 3001),
  app: {
    // Provide fallback keys to avoid "App keys are required" error when .env isn't loaded.
    // Override by setting `APP_KEYS` in your root .env as a comma-separated list.
    keys: env.array('APP_KEYS', ['change-me-1', 'change-me-2', 'change-me-3', 'change-me-4']),
  },
});
