import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Alibaba Cloud OSS serves files directly and has no Node/Worker runtime.
  // Generate a fully static site that can be uploaded as-is.
  output: 'export',
};

export default nextConfig;

