import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tài khoản | HUST Shop",
  description: "Quản lý thông tin tài khoản và lịch sử đơn hàng.",
  alternates: {
    canonical: "/account",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type AccountLayoutProps = {
  children: ReactNode;
};

export default function AccountLayout({ children }: AccountLayoutProps) {
  return children;
}