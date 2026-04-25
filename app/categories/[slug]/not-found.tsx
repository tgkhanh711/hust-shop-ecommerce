import Link from "next/link";

import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";

export default function CategoryNotFound() {
  return (
    <section className="bg-white">
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            404
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Không tìm thấy danh mục
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-600">
            Danh mục này không tồn tại, đã bị ẩn, hoặc đường dẫn không đúng.
          </p>

          <Link
            href={routes.products}
            className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Quay lại tất cả sản phẩm
          </Link>
        </div>
      </Container>
    </section>
  );
}