const million = require('million/compiler')
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www3.animeflv.net', 'cdn.animeflv.net', 'animeflv.net'],
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
      },
      {
        protocol: 'https',
        hostname: 'animeflv.net',
        port: '443',
        pathname: '/uploads/animes/covers/*'
      }
    ]
  }
}

module.exports = million.next(nextConfig)
