/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com http://localhost:* http://127.0.0.1:*; img-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:*; connect-src 'self' http: https: ws: wss: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* https://api.razorpay.com https://lumberjack.razorpay.com; frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com; object-src 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
