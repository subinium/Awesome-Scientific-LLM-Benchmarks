/** @type {import('next').NextConfig} */
const nextConfig = {
  // shields.io badges and external logos are loaded via plain <img>, so keep
  // the image optimizer out of the way.
  images: { unoptimized: true },
};

export default nextConfig;
