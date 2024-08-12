/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Host',
              value: 'scissors.talut.tech',
            },
          ],
        },
      ];
    },
    // Add this to ensure NextAuth.js can handle the auth routes correctly
    async rewrites() {
      return [
        {
          source: '/api/auth/:path*',
          destination: '/api/auth/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;