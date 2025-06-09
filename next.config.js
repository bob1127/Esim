const path = require("path");

module.exports = {
  
 images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: true, // 設置路由結尾添加斜線
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // 設定 webpack 的文件監視間隔
      aggregateTimeout: 300, // 設定聚合超時時間
    };
    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")], // 設定 SASS 目錄的路徑
  },
  // plugins: [
  //   require('tailwind-scrollbar'),
  // ],
  async rewrites() {
    return [
      {
        source: "/api/:path*", // 代理所有 /api 開頭的請求
        destination: "https://external-api.com/:path*", // 目標 API 地址，請替換為實際的外部 API
      },
    ];
  },
};
