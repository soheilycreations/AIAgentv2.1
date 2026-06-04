/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large PDF uploads
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

module.exports = nextConfig
