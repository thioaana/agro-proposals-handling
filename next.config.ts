import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['ccxobfquxwtxvrotsjfs.supabase.co'], // Add your Supabase storage URL domain here
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
