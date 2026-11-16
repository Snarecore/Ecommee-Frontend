import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/fi",
      "react-icons/io5",
      "react-icons/ri",
      "react-icons/fa6",
      "react-icons/hi2",
      "react-icons/md",
      "swiper",
      "jotai",
      "react-fast-marquee"
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Proxy the API through this origin so the backend's httpOnly auth cookies are
  // first-party. Set BACKEND_API_URL (e.g. https://backend.example.com/api/v1) and
  // NEXT_PUBLIC_API_BASE_URL=/api/v1 to enable it.
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL?.trim().replace(/\/+$/, "");
    if (!backendUrl) return [];
    return [{ source: "/api/v1/:path*", destination: `${backendUrl}/:path*` }];
  },
  serverExternalPackages: ["isomorphic-dompurify", "jsdom", "html-encoding-sniffer", "@exodus/bytes"],
};

export default nextConfig;
