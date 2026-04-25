import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductVisibilityButton } from "@/components/admin/product-visibility-button";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm | HUST Shop",
  description: "Trang quản lý danh sách sản phẩm của HUST Shop.",
};

type ProductImage = {
  image_url: string;
  alt_text: string | null;
  is_primary: boolean | null;
};

type Category = {
  name: string;
  slug: string;
} | null;

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  categories: Category;
  product_images: ProductImage[];
};

type RawCategory =
  | {
      name: string;
      slug: string;
    }
  | {
      name: string;
      slug: string;
    }[]
  | null;

type RawAdminProduct = Omit<AdminProduct, "categories" | "product_images"> & {
  categories: RawCategory;
  product_images: ProductImage[] | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminProductsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        price,
        sale_price,
        stock,
        is_active,
        created_at,
        categories (
          name,
          slug
        ),
        product_images (
          image_url,
          alt_text,
          is_primary
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Không thể tải danh sách sản phẩm: {error.message}
        </div>
      </main>
    );
  }

  const rawProducts = (products ?? []) as unknown as RawAdminProduct[];

const productList: AdminProduct[] = rawProducts.map((product) => ({
  ...product,
  categories: Array.isArray(product.categories)
    ? product.categories[0] ?? null
    : product.categories,
  product_images: product.product_images ?? [],
}));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Admin Dashboard
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <Package className="h-4 w-4" />
              Quản lý sản phẩm
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Danh sách sản phẩm
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Hiện có {productList.length} sản phẩm trong hệ thống.
            </p>
          </div>
        </div>

        <Link
  href="/admin/products/new"
  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
>
  Thêm sản phẩm
</Link>

        {productList.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-medium text-slate-900">Chưa có sản phẩm nào</p>
            <p className="mt-1 text-sm text-slate-600">
              Bạn cần thêm dữ liệu mẫu hoặc tạo sản phẩm mới trong database.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                  <th className="px-4 py-3 font-semibold">Danh mục</th>
                  <th className="px-4 py-3 font-semibold">Giá gốc</th>
                  <th className="px-4 py-3 font-semibold">Giá sale</th>
                  <th className="px-4 py-3 font-semibold">Tồn kho</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {productList.map((product) => {
                  const primaryImage =
                    product.product_images.find((image) => image.is_primary) ??
                    product.product_images[0];

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.image_url}
                                alt={primaryImage.alt_text || product.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                No img
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-950">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {product.categories?.name ?? "Chưa có danh mục"}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-900">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="px-4 py-4">
                        {product.sale_price ? (
                          <span className="font-medium text-red-600">
                            {formatCurrency(product.sale_price)}
                          </span>
                        ) : (
                          <span className="text-slate-400">Không có</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            product.stock > 0
                              ? "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                              : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-4 py-4">
  <span
    className={
      product.is_active
        ? "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
    }
  >
    {product.is_active ? "Đang hiện" : "Đang ẩn"}
  </span>
</td>

                      <td className="px-4 py-4 text-slate-500">
                        /products/{product.slug}
                      </td>
                      <td className="px-4 py-4">
  <div className="flex items-center gap-2">
    <Link
      href={`/admin/products/${product.id}/edit`}
      className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 px-4 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
    >
      Sửa
                          </Link>
                          
                          <ProductVisibilityButton
  productId={product.id}
  productName={product.name}
  isActive={product.is_active}
/>

    <DeleteProductButton
      productId={product.id}
      productName={product.name}
    />
  </div>
</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}