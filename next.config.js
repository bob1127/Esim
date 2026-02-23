/** @type {import('next').NextConfig} */
const path = require("path");

// ★★★ 引入 PWA 套件並進行設定 ★★★
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  // 極度重要：開發環境時關閉 PWA，避免快取導致畫面不更新
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
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
    // 注意：如果你沒有安裝 'raw-loader'，請先執行 `npm install raw-loader --save-dev`
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