import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";

export const metadata: Metadata = {
  title: "Đặt hàng thành công | HUST Shop",
  description: "Đơn hàng của bạn đã được ghi nhận thành công tại HUST Shop.",
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { orderId } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-16">
      <ClearCartOnSuccess />

      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
          Đặt hàng thành công
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Cảm ơn bạn đã mua hàng tại HUST Shop. Đơn hàng của bạn đã được ghi
          nhận trong hệ thống.
        </p>

        {orderId ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Mã đơn hàng:
            <span className="ml-2 font-semibold text-slate-950">{orderId}</span>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Về trang chủ
          </Link>

          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Tiếp tục mua hàng
          </Link>
        </div>
      </section>
    </main>
  );
}