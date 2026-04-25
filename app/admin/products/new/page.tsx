import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { CreateProductForm } from "@/components/admin/create-product-form";

export const metadata: Metadata = {
  title: "Thêm sản phẩm mới | HUST Shop",
  description: "Trang thêm sản phẩm mới cho admin HUST Shop.",
};

type CategoryOption = {
  id: string;
  name: string;
};

export default async function NewProductPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Không thể tải danh mục: {error.message}
        </div>
      </main>
    );
  }

  const categoryList = (categories ?? []) as CategoryOption[];

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
            Thêm sản phẩm mới
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Nhập thông tin sản phẩm, chọn danh mục và upload ảnh đại diện.
          </p>
        </div>

        <div className="mt-6">
          <CreateProductForm categories={categoryList} />
        </div>
      </section>
    </main>
  );
}