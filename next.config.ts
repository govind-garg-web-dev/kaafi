import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Silence the "multiple lockfiles" warning — root package-lock.json is unrelated
    root: __dirname,
  },
  async headers() {
    return [
      {
        // Allow Expo Snack to be embedded in the project editor iframe
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://snack.expo.dev https://api.razorpay.com",
              "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://exp.host https://api.expo.dev https://app.loops.so https://api.razorpay.com",
              "img-src 'self' data: blob: https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
