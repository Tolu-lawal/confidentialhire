const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino', 'pino-pretty', 'lokijs', 'encoding', '@react-native-async-storage/async-storage');
    return config;
  },
};

export default nextConfig;