/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Generate the `.next/standalone` directory so our Dockerfile can copy it.
   * Without this, the COPY step fails because the folder is missing.
   */
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  /**
   * Allow Server Actions to work behind proxies (like GitHub Codespaces)
   * This fixes the x-forwarded-host header mismatch error
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      // Allow Server Actions from Codespaces domains
      allowedOrigins:
        process.env.NODE_ENV === "development"
          ? ["localhost:3000", "*.app.github.dev", "*.github.dev"]
          : undefined,
    },
  },
};

module.exports = nextConfig;
