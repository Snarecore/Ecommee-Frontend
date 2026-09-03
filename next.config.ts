import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  serverExternalPackages: ["isomorphic-dompurify", "jsdom", "html-encoding-sniffer", "@exodus/bytes"],
};

export default nextConfig;
