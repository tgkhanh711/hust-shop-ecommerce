import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sản phẩm | HUST Shop",
  description:
    "Khám phá tất cả sản phẩm thời trang đang bán tại HUST Shop.",
  alternates: {
    canonical: "/products",
  },
  robots: {
    index: true,
    follow: true,
  },
};

type ProductsLayoutProps = {
  children: ReactNode;
};

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return children;
}