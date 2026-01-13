// next.config.js
module.exports = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  
  // 🔥 ADD THESE LINES:
  generateBuildId: () => {
    // Use timestamp to ensure unique build ID
    return `build-${Date.now()}`
  },
  
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ]
  }
}