import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Đăng nhập | HUST Shop",
  description: "Đăng nhập tài khoản HUST Shop để mua hàng và quản lý đơn hàng.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type LoginLayoutProps = {
  children: ReactNode;
};

export default function LoginLayout({ children }: LoginLayoutProps) {
  return children;
}