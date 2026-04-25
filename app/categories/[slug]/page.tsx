import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { routes } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

type CategoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!category) {
    return {
      title: "Không tìm thấy danh mục | HUST Shop",
    };
  }

  return {
    title: `${category.name} | HUST Shop`,
    description:
      category.description ?? `Xem các sản phẩm thuộc danh mục ${category.name}.`,
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle<Category>();

  if (categoryError) {
    return (
      <section className="bg-white">
        <Container className="py-12 sm:py-16">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Không đọc được danh mục.</p>
            <p className="mt-2">{categoryError.message}</p>
          </div>
        </Container>
      </section>
    );
  }

  if (!category) {
    notFound();
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, price, sale_price, stock, thumbnail_url")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<ProductPreview[]>();

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8">
          <Link
            href={routes.products}
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            ← Quay lại tất cả sản phẩm
          </Link>
        </div>

        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Category
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {category.name}
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            {category.description ?? "Danh mục này chưa có mô tả."}
          </p>
        </div>

        {productsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">
              Không đọc được sản phẩm trong danh mục.
            </p>
            <p className="mt-2">{productsError.message}</p>
          </div>
        ) : null}

        {!productsError && products?.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Danh mục này hiện chưa có sản phẩm.
          </div>
        ) : null}

        {!productsError && products && products.length > 0 ? (
          <>
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
              Danh mục này có{" "}
              <span className="font-semibold">{products.length}</span> sản phẩm.
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