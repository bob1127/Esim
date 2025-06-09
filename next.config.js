const path = require("path");

module.exports = {
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dyx.wxv.mybluehost.me",
        pathname: "/website_a8bfc44c/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**", // 用 /** 匹配所有路徑
      },
    ],
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
        source: "/api/:path*",
        destination: "https://external-api.com/:path*",
      },
    ];
  },
};
