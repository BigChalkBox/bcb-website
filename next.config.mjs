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
  // External packages that need native binaries
  serverExternalPackages: ['sharp', 'pdf2pic'],
};

export default nextConfig;
