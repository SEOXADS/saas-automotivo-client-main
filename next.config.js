module.exports = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  
  images: {
    remotePatterns: [
      // Production - ALL paths (including /storage/)
      {
        protocol: 'https',
        hostname: 'api.omegaveiculos.com.br',
        pathname: '/**',  // ✅ Allow ALL paths
      },
      {
        protocol: 'https',
        hostname: 'www.api.omegaveiculos.com.br',
        pathname: '/**',
      },
      // Local development - storage path
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',  // ✅ For uploaded images
      },
      // Local development - API path (keep for compatibility)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/public/images/**',
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
