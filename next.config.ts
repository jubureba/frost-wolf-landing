import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import { execSync } from "child_process";
import packageJson from "./package.json";

let commitHash = "";
try {
  commitHash = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  commitHash = "no-git";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "render.worldofwarcraft.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "wow.zamimg.com", port: "", pathname: "/images/wow/icons/large/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", port: "", pathname: "/**" }, // Adicionado
    ],
  },
  env: {
    NEXT_PUBLIC_VERSION: packageJson.version,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().split("T")[0],
    NEXT_PUBLIC_COMMIT: commitHash,
  },
  webpack(config: Configuration) {
    config.resolve = {
      ...(config.resolve || {}),
      fallback: {
        ...(config.resolve?.fallback || {}),
        fs: false,
      },
    };
    return config;
  },
};

export default nextConfig;
