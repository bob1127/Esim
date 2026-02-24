/** @type {import('next').NextConfig} */
const path = require("path");

// ★★★ 引入 PWA 套件並進行「終極強化版」設定 ★★★
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true, // 邊走邊存：客人點過的頁面自動快取
  aggressiveFrontEndNavCaching: true, 
  reloadOnOnline: true, // 當網路恢復時，自動重新載入頁面獲取最新資料
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // 開發環境關閉
  
  // ★★★ 殺手級防護：明確指定斷線時要顯示的頁面 ★★★
  fallbacks: {
    document: "/_offline", // 當找不到快取且沒網路時，強制顯示這頁
  },
  
  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 5000000, // 提高單一檔案快取上限到 5MB
    
    // ★★★ 核心快取策略 (Runtime Caching) 解決 iOS 白畫面與斷網無資料問題 ★★★
    runtimeCaching: [
      {
        // 1. 專門拯救 iOS 啟動崩潰的「首頁強制快取」
        urlPattern: /^\/$/, 
        handler: 'StaleWhileRevalidate', // 確保 iOS 一啟動就能瞬間拿到畫面，不會判定斷線
        options: {
          cacheName: 'start-url-cache',
          expiration: {
            maxEntries: 1,
            maxAgeSeconds: 24 * 60 * 60 * 30, // 首頁快取保留 30 天
          },
        },
      },
      {
        // 2. 攔截所有 Next.js 切換頁面時需要的 .json 資料 (SSG 必備)
        urlPattern: /\/_next\/data\/.*\.json$/i,
        handler: 'StaleWhileRevalidate', 
        options: {
          cacheName: 'next-data-cache',
          expiration: {
            maxEntries: 200, 
            maxAgeSeconds: 24 * 60 * 60 * 7, 
          },
        },
      },
      {
        // 3. 攔截您 WordPress 裡面的圖片 (避免斷網破圖)
        urlPattern: /^https:\/\/inf\.fjg\.mybluehost\.me\/.*\/wp-content\/uploads\/.*/i,
        handler: 'CacheFirst', 
        options: {
          cacheName: 'wp-image-cache',
          expiration: {
            maxEntries: 300,
            maxAgeSeconds: 24 * 60 * 60 * 30, 
          },
        },
      },
      {
        // 4. 攔截其他 WordPress 一般的 API 請求
        urlPattern: /^https:\/\/inf\.fjg\.mybluehost\.me\/.*\/wp-json\/.*/i,
        handler: 'NetworkFirst', 
        options: {
          cacheName: 'wp-api-cache',
          networkTimeoutSeconds: 5, // 5秒連不上就視為斷網，立刻給舊資料
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 7,
          },
        },
      }
    ]
  },
});

const nextConfig = {
  reactStrictMode: true, 
  trailingSlash: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },

  async rewrites() {
    return [
      {
        source: "/api/newebpay-notify",
        destination: "/api/newebpay-notify/",
      },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ["raw-loader"], 
    });

    return config;
  },
};

// ★★★ 使用 withPWA 包裝原本的 nextConfig 並輸出 ★★★
module.exports = withPWA(nextConfig);