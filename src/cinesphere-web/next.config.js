/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" }
    ]
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:5001/api/:path*' }];
  }
};


module.exports = nextConfig;
