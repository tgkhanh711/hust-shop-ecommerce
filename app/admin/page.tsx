import type { Metadata } from "next";
import Link from "next/link";
import { Package, ReceiptText, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin Dashboard | HUST Shop",
  description: "Trang quản trị hệ thống HUST Shop.",
};

export default async function AdminPage() {
  const { profile } = await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4" />
              Khu vực quản trị
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Xin chào {profile.full_name || profile.email}. Đây là khu vực chỉ
              dành cho tài khoản có quyền admin.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/products"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <Package className="h-5 w-5 text-slate-900" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Quản lý sản phẩm
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Xem danh sách sản phẩm trong hệ thống.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <ReceiptText className="h-5 w-5 text-slate-900" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Quản lý đơn hàng
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Xem các đơn hàng khách đã đặt.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}