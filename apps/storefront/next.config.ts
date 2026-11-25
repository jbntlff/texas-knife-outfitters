import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

// Set in config/env.shared.local — the current machine's LAN IP, so phones
// and other devices on the network can reach this dev server's Supabase
// storage images. Changes depending on which location you're working from.
const lanHost = process.env.LAN_HOST;

const isDev = process.env.NODE_ENV === "development";

/**
 * Builds an image remotePattern from an origin URL env var, so the image
 * optimizer accepts whatever host Supabase / the storefront are actually on
 * (LAN IP in dev, the real domains in production).
 */
function patternFromUrl(
  url: string | undefined,
  pathname: string,
): RemotePattern[] {
  if (!url) return [];

  try {
    const { protocol, hostname, port } = new URL(url);

    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "tkb.local",
    ...(lanHost ? [lanHost] : []),
  ],
  images: {
    // Serve resized AVIF/WebP instead of the multi-megabyte originals.
    formats: ["image/avif", "image/webp"],
    // Product photos rarely change; let the optimizer cache them for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // In dev, Supabase and the storefront live on a private LAN IP, which the
    // optimizer refuses by default. Never enabled in production.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "tkb.local",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      ...(lanHost
        ? [
            {
              protocol: "http" as const,
              hostname: lanHost,
              port: "54321",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      ...patternFromUrl(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        "/storage/v1/object/public/**",
      ),
      // resolveProductImageUrl turns seeded "/images/..." paths into absolute
      // storefront URLs, so the storefront's own origin must be allowed too.
      ...patternFromUrl(
        process.env.NEXT_PUBLIC_STOREFRONT_URL,
        "/images/**",
      ),
    ],
  },
};

export default nextConfig;
