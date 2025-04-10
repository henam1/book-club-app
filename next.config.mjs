/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/book-club-app',
  assetPrefix: '/book-club-app/',
  images: {
    unoptimized: true,
  remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/books/**',
      },
    ],
  },
};

export default nextConfig;
