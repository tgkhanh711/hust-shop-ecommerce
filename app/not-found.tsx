import Link from "next/link";

import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";

export default function NotFoundPage() {
  return (
    <section className="bg-white">
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            404
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Không tìm thấy trang
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Trang bạn đang truy cập không tồn tại hoặc đã bị thay đổi đường dẫn.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={routes.home}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Về trang chủ
            </Link>

            <Link
              href={routes.products}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}