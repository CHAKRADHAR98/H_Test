
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      // Enable if needed for specific experimental features
      // appDir: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    // Add webpack configuration to handle polyfills if needed
    webpack: (config) => {
      // Add polyfill for crypto-related dependencies if needed
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      };
      
      return config;
    },
  };
  
  module.exports = nextConfig;