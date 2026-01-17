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
  serverExternalPackages: ['sharp', 'canvas', 'pdfjs-dist', '@napi-rs/canvas'],
};

export default nextConfig;
