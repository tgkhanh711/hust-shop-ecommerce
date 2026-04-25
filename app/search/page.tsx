import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { SearchForm } from "@/components/search/search-form";
import { createClient } from "@/lib/supabase/server";
import { searchQuerySchema } from "@/validations/search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

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
  title: "Tìm kiếm | HUST Shop",
  description: "Tìm kiếm sản phẩm tại HUST Shop.",
};

function getSearchQuery(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return searchQuerySchema.parse(rawValue ?? "");
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = getSearchQuery(resolvedSearchParams.q);
  const hasQuery = query.length > 0;

  const supabase = await createClient();

  let products: ProductPreview[] = [];
  let errorMessage: string | null = null;

  if (hasQuery) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, sale_price, stock, thumbnail_url")
      .eq("is_active", true)
      .ilike("name", `%${query}%`)
      .order("created_at", { ascending: false })
      .returns<ProductPreview[]>();

    products = data ?? [];
    errorMessage = error?.message ?? null;
  }

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Search
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Tìm kiếm sản phẩm
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Nhập tên sản phẩm bạn muốn tìm. Hiện tại chức năng tìm kiếm đang tìm
            theo tên sản phẩm trong bảng products của Supabase.
          </p>
        </div>

        <SearchForm defaultValue={query} className="mb-8" />

        {!hasQuery ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Hãy nhập từ khóa để bắt đầu tìm kiếm. Ví dụ: áo, quần, giày, balo.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Không tìm kiếm được sản phẩm.</p>
            <p className="mt-2">{errorMessage}</p>
          </div>
        ) : null}

        {hasQuery && !errorMessage && products.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Không tìm thấy sản phẩm nào phù hợp với từ khóa{" "}
            <span className="font-semibold text-slate-950">“{query}”</span>.
          </div>
        ) : null}

        {hasQuery && !errorMessage && products.length > 0 ? (
          <>
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
              Tìm thấy <span className="font-semibold">{products.length}</span>{" "}
              sản phẩm cho từ khóa{" "}
              <span className="font-semibold text-slate-950">“{query}”</span>.
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