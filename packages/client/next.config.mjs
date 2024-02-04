/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
  },
};

export default nextConfig;
