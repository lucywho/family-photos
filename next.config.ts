import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      '@/components',
      'lucide-react',
      '@radix-ui/react-*',
    ],
  },
};

export default nextConfig;
