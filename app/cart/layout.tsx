import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Giỏ hàng | HUST Shop",
  description: "Xem và quản lý các sản phẩm trong giỏ hàng của bạn.",
  alternates: {
    canonical: "/cart",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type CartLayoutProps = {
  children: ReactNode;
};

export default function CartLayout({ children }: CartLayoutProps) {
  return children;
}