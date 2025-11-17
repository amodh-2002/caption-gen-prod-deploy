/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Generate the `.next/standalone` directory so our Dockerfile can copy it.
   * Without this, the COPY step fails because the folder is missing.
   */
  output: process.env.NODE_ENV === 'production' ? "standalone" : undefined,
  
  /**
   * Allow Server Actions to work behind proxies (like GitHub Codespaces)
   * This fixes the x-forwarded-host header mismatch error
   */
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      // In development, be more lenient with origin validation
      ...(process.env.NODE_ENV === 'development' && {
        // Allow requests from any origin in dev (for Codespaces proxy)
        allowedOrigins: ['*'],
      }),
    },
  },
};

module.exports = nextConfig;
