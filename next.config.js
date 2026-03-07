/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://bharatlearn-backend.onrender.com";
    return [
      { source: "/api/:path*",  destination: `${backendUrl}/api/:path*` },
      { source: "/auth/:path*", destination: `${backendUrl}/auth/:path*` },
    ];
  },
};

module.exports = nextConfig;
