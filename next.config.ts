import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline", // Offline fallback page
  },
  runtimeCaching: [
    // Cache OMDB poster images
    {
      urlPattern: /^https:\/\/m\.media-amazon\.com\/images\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "omdb-images",
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Cache TMDb poster images
    {
      urlPattern: /^https:\/\/image\.tmdb\.org\/t\/p\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "tmdb-images",
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Cache library API responses for offline access
    {
      urlPattern: /\/api\/(export|notes|random)\/?$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "library-api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Cache other API responses with network-first strategy
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Cache all main pages with stale-while-revalidate for faster loading
    {
      urlPattern: /^\/?$/i, // Home page
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "home-cache",
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    // Cache feature pages
    {
      urlPattern: /^https?:\/\/.*\/(profile|wall|blindspots|connections|watchlist|watching|year-review|search)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    // Cache movie detail pages
    {
      urlPattern: /^https?:\/\/.*\/movie\/[^/]+$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "movie-pages-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    // Cache static assets
    {
      urlPattern: /\.(?:js|css|woff2?|ttf|eot|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Cache fonts from Google
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
};

export default withPWA(nextConfig);

