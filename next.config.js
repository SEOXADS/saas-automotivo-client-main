module.exports = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  
  images: {
    remotePatterns: [
      // ============ PRODUCTION ============
      {
        protocol: 'https',
        hostname: 'api.omegaveiculos.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.api.omegaveiculos.com.br',
        pathname: '/**',
      },
      
      // ============ LOCAL DEVELOPMENT ============
      // Laravel storage (primary for uploaded images)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      // API public images path
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/public/images/**',
      },
      // Catch-all for localhost:8000 (any path)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      // 127.0.0.1 alternative (some systems use this)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  }
};
