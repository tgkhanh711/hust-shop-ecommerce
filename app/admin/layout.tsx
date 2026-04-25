import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Quản trị admin | HUST Shop",
  description: "Khu vực quản trị sản phẩm và đơn hàng của HUST Shop.",
  alternates: {
    canonical: "/admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}