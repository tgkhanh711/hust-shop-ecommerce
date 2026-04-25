const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  name: "HUST Shop",
  url: siteUrl.replace(/\/$/, ""),
  description:
    "HUST Shop là website bán hàng thời trang demo xây dựng bằng Next.js, TypeScript, Tailwind CSS và Supabase.",
  keywords: [
    "HUST Shop",
    "website bán hàng",
    "ecommerce",
    "thời trang",
    "Next.js",
    "Supabase",
  ],
};

export function getAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteConfig.url}${normalizedPath}`;
}