/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['cheerio'],
  // Configuração para servir o portal na raiz
  basePath: '',
  assetPrefix: '',
  images: {
    domains: [
      'production.autoforce.com',
      'saas-automotivo-client.vercel.app',
      '*.webcarros.app.br'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  poweredByHeader: false,
  // Configuração para servir assets estáticos
  async rewrites() {
    return [
      // Servir assets do portal na raiz
      {
        source: '/portal/assets/:path*',
        destination: '/portal/assets/:path*',
      },
    ]
  },
}

module.exports = nextConfig
