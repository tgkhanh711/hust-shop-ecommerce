import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tìm kiếm sản phẩm | HUST Shop",
  description: "Tìm kiếm sản phẩm theo tên, danh mục hoặc từ khóa.",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
  },
};

type SearchLayoutProps = {
  children: ReactNode;
};

export default function SearchLayout({ children }: SearchLayoutProps) {
  return children;
}