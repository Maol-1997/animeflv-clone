/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  images: {
    domains: ['www3.animeflv.net', 'cdn.animeflv.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www3.animeflv.net',
        port: '443',
        pathname: '/uploads/animes/thumbs/*'
      },
      {
        protocol: 'https',
        hostname: 'cdn.animeflv.net',
        port: '443',
        pathname: '/screenshots/*'
      }
    ]
  }
}

module.exports = nextConfig
