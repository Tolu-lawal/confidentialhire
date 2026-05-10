const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino', 'pino-pretty', 'lokijs', 'encoding');
    config.resolve.alias['@react-native-async-storage/async-storage'] = false;
    return config;
  },
};

export default nextConfig;