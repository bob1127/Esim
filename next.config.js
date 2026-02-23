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
    document: "/_offline", // 當找不到快取且沒網路時，強制顯示這頁 (請確保您有建立 pages/_offline.js)
  },
  
  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 5000000, // 提高單一檔案快取上限到 5MB，避免較大的靜態資源沒被存到
  },
});

const nextConfig = {
  reactStrictMode: true, // 建議開啟，有助於抓出 React 錯誤
  trailingSlash: true,

  images: {
    // ✅ 允許所有外部圖片網域 (Next.js 14+ 寫法)
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
    // 允許 SVG 圖像
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
    // 針對 GLSL shader 檔案的處理
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