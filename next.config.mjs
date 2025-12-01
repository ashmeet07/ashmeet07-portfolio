/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github-readme-activity-graph.vercel.app',
      },
    ],
  },
};

export default nextConfig;
