import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Thanh toán | HUST Shop",
  description: "Nhập thông tin nhận hàng và hoàn tất đơn hàng của bạn.",
  alternates: {
    canonical: "/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type CheckoutLayoutProps = {
  children: ReactNode;
};

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return children;
}