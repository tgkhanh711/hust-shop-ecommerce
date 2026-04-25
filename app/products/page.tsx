import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
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

export const metadata = {
  title: "Sản phẩm | HUST Shop",
  description: "Danh sách sản phẩm đang bán tại HUST Shop.",
};

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, sale_price, stock, thumbnail_url")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<ProductPreview[]>();

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Products
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Tất cả sản phẩm
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Danh sách sản phẩm đang được bán tại HUST Shop. Dữ liệu được đọc
            trực tiếp từ Supabase bằng Server Component.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Không đọc được danh sách sản phẩm.</p>
            <p className="mt-2">{error.message}</p>
          </div>
        ) : null}

        {!error && products?.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-600">
            Chưa có sản phẩm nào trong database.
          </div>
        ) : null}

        {!error && products && products.length > 0 ? (
          <>
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
              Hiện có <span className="font-semibold">{products.length}</span>{" "}
              sản phẩm.
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : null}
      </Container>
    </section>
  );
}