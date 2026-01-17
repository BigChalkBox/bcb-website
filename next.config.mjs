/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crqheuuvsgtzejaestyj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Force sharp to be treated as external package for Vercel compatibility
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
