/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/:path*`,
      },
    ]
  },
  env: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  }
}

export default nextConfig
