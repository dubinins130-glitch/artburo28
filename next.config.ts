import type { NextConfig } from "next";

// STATIC_EXPORT=1 собирает папку out/ из обычных файлов: её можно загрузить на любой
// статический хостинг. Картинки в этом режиме отдаются как есть, без оптимизации на сервере.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  agentRules: false,
  devIndicators: false,
  poweredByHeader: false,
  ...(staticExport ? { output: "export" as const, trailingSlash: true } : {}),
  images: {
    formats: ["image/webp"],
    qualities: [75, 85],
    ...(staticExport ? { unoptimized: true } : {}),
  },
};

export default nextConfig;
