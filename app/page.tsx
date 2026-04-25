import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { routes } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

type ProductPreview = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  thumbnail_url: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, sale_price, stock, thumbnail_url, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)
    .returns<ProductPreview[]>();

  return (
    <section className="bg-white">
      <Container className="py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            E-commerce Project
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            HUST Shop
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Website bán hàng đang được xây dựng bằng Next.js và Supabase.
          </p>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Sản phẩm mới
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Dữ liệu bên dưới được lấy trực tiếp từ bảng products trong
                Supabase.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
  <div className="w-fit rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-green-700">
    Supabase: Đã kết nối
  </div>

  <Link
    href={routes.products}
    className="w-fit rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
  >
    Xem tất cả sản phẩm
  </Link>
</div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <p className="font-semibold">Không đọc được sản phẩm.</p>
              <p className="mt-2">{error.message}</p>
            </div>
          ) : null}

          {!error && products?.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-600">
              Chưa có sản phẩm nào trong database.
            </div>
          ) : null}

          {!error && products && products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}