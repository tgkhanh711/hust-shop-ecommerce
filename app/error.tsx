"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="bg-white">
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Error
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Có lỗi xảy ra
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-700">
            Website gặp lỗi trong quá trình xử lý. Bạn có thể thử tải lại trang
            hoặc quay về trang chủ.
          </p>

          <div className="mt-5 rounded-xl border border-red-200 bg-white px-4 py-3 text-left text-sm text-red-700">
            {error.message}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Thử lại
            </button>

            <Link
              href={routes.home}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}