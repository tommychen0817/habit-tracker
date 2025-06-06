/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
      serverComponentsExternalPackages: [],
    },
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
        },
      ]
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      unoptimized: true,
    },
  }
  
  export default nextConfig
  