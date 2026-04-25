import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Đăng ký | HUST Shop",
  description: "Tạo tài khoản HUST Shop để mua hàng và theo dõi đơn hàng.",
  alternates: {
    canonical: "/register",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type RegisterLayoutProps = {
  children: ReactNode;
};

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return children;
}