import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "HUST Shop | Website bán hàng thời trang",
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "HUST Shop | Website bán hàng thời trang",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "HUST Shop | Website bán hàng thời trang",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen flex-col bg-white text-slate-950">
          <SiteHeader />

          <main className="flex-1">{children}</main>

          <SiteFooter />
        </div>
      </body>
    </html>
  );
}