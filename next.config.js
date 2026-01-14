module.exports = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.omegaveiculos.com.br',
        pathname: '/api/public/images/**',
      },
      {
        protocol: 'https',
        hostname: 'www.api.omegaveiculos.com.br',
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
