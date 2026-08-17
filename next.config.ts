import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "bazaarbound-api.qligence.com",
      },
      {
        protocol: "https",
        hostname: "bazaarbound.com",
      },
      {
        protocol: "https",
        hostname: "ecommerce-backend.genxsolutions.org",
      },
      {
        protocol: "https",
        hostname: "cdn.bazaarbound.com",
      },
      {
        protocol: "https",
        hostname: "*.bazaarbound.com",
      },
      {
        protocol: "https",
        hostname: "*.qligence.com",
      },
      {
        protocol: "https",
        hostname: "*.genxsolutions.org",
      }
    ],
  },
  webpack: (config) => {
    config.resolve.alias['react-router-dom'] = path.resolve(process.cwd(), './src/routes-compat.tsx');
    config.resolve.alias['react-helmet-async'] = path.resolve(process.cwd(), './src/helmet-compat.tsx');
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        'react-router-dom': './src/routes-compat.tsx',
        'react-helmet-async': './src/helmet-compat.tsx',
      },
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
