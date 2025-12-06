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
    domains: [
        'i.imgur.com', 
        // Add any other external image hosts you use here
    ],
  },
};

export default nextConfig;
