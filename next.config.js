/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.receitasnestle.com.br",
        port: "",
        pathname: "/sites/default/files/**"
      }
    ]
  }
};

module.exports = nextConfig;