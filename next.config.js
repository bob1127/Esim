// next.config.js
const path = require("path");

module.exports = {
  images: {
    // ✅ 允許所有外部圖片網域
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
    // 或者直接用下面這行（Next.js 14+ 支援）
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  trailingSlash: true,

  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
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
      test: /\.(glsl|vs|fs)$/,
      use: ["babel-loader", "babel-plugin-glsl"],
    });
    return config;
  },
};
