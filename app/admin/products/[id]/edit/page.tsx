import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { EditProductForm } from "@/components/admin/edit-product-form";
import { UpdateProductImageForm } from "@/components/admin/update-product-image-form";

export const metadata: Metadata = {
  title: "Sửa sản phẩm | HUST Shop",
  description: "Trang sửa thông tin sản phẩm cho admin HUST Shop.",
};

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type CategoryOption = {
  id: string;
  name: string;
};

type ProductForEdit = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  description: string | null;
  price: number | string;
  sale_price: number | string | null;
  stock: number;
};

type ProductImageForEdit = {
  image_url: string;
  alt_text: string | null;
  is_primary: boolean | null;
};

type ProductWithImages = ProductForEdit & {
  product_images: ProductImageForEdit[];
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
  .from("products")
  .select(
    `
      id,
      name,
      slug,
      category_id,
      description,
      price,
      sale_price,
      stock,
      product_images (
        image_url,
        alt_text,
        is_primary
      )
    `
  )
  .eq("id", id)
  .maybeSingle();

  if (productError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Không thể tải sản phẩm: {productError.message}
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
          Không tìm thấy sản phẩm cần sửa.
        </div>
      </main>
    );
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (categoriesError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Không thể tải danh mục: {categoriesError.message}
        </div>
      </main>
    );
  }

  const categoryList = (categories ?? []) as CategoryOption[];

  const editableProduct = product as ProductWithImages;

const primaryImage =
  editableProduct.product_images.find((image) => image.is_primary) ??
  editableProduct.product_images[0] ??
  null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sản phẩm
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Sửa sản phẩm
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cập nhật thông tin cơ bản của sản phẩm: {product.name}
          </p>
        </div>

        <div className="mt-6">
          <div className="space-y-6">
  <EditProductForm product={editableProduct} categories={categoryList} />

  <UpdateProductImageForm
    productId={editableProduct.id}
    productSlug={editableProduct.slug}
    productName={editableProduct.name}
    currentImageUrl={primaryImage?.image_url}
    currentImageAlt={primaryImage?.alt_text}
  />
</div>
        </div>
      </section>
    </main>
  );
}