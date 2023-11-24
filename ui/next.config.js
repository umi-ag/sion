/** @type {import('next').NextConfig} */
const nextConfig = {
  runtime: "edge",
  images: {
    domains: [
      // 'storage.googleapis.com',
      // "user-images.githubusercontent.com",
      // "assets.coingecko.com",
    ],
  },
};

module.exports = nextConfig;
