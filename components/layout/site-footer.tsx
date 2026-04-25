import Link from "next/link";

import { routes } from "@/constants/routes";
import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-slate-950">HUST Shop</p>
            <p className="mt-1 text-sm text-slate-600">
              Website bán hàng xây dựng bằng Next.js và Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <Link href={routes.home} className="hover:text-slate-950">
              Trang chủ
            </Link>

            <Link href={routes.products} className="hover:text-slate-950">
              Sản phẩm
            </Link>

            <Link href={routes.cart} className="hover:text-slate-950">
              Giỏ hàng
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          © 2026 HUST Shop. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}