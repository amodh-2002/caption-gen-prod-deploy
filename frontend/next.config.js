/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Generate the `.next/standalone` directory so our Dockerfile can copy it.
   * Without this, the COPY step fails because the folder is missing.
   */
  output: "standalone",
};

module.exports = nextConfig;
