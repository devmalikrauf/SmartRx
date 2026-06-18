/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'], // Allow prescription images stored on Cloudinary
  },
}

module.exports = nextConfig;
