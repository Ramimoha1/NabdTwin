export default ({ env }) => ({
  auth: {
    // Fallback provided to avoid startup errors when the root .env isn't loaded
    secret: env('ADMIN_JWT_SECRET', 'change-me-admin-secret'),
  },
  apiToken: {
    // Prefer setting `API_TOKEN_SALT` in your environment. Fallback provided for local/dev.
    salt: env('API_TOKEN_SALT', 'change-me-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'change-me-transfer-token-salt'),
    },
  },
  secrets: {
    // encryptionKey should be 32+ bytes; prefer reading from env for production.
    encryptionKey: env('ENCRYPTION_KEY', 'change-me-encryption-key'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
