/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@mistralai/mistralai']
  }
}

export default nextConfig;