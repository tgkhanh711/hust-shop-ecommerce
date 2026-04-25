"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateProduct } from "@/actions/admin-products";

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

type EditProductFormProps = {
  product: ProductForEdit;
  categories: CategoryOption[];
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function EditProductForm({
  product,
  categories,
}: EditProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
  }

  function handleSubmit(formData: FormData) {
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const result = await updateProduct(formData);

      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        router.push("/admin/products");
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="previousSlug" value={product.slug} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-800">
            Tên sản phẩm
          </label>

          <input
            id="name"
            name="name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium text-slate-800">
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(createSlug(event.target.value))}
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
            required
          />

          <p className="text-xs text-slate-500">URL sản phẩm: /products/{slug}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="categoryId"
          className="text-sm font-medium text-slate-800"
        >
          Danh mục
        </label>

        <select
          id="categoryId"
          name="categoryId"
          defaultValue={product.category_id ?? ""}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-950"
          required
        >
          <option value="">Chọn danh mục</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-800"
        >
          Mô tả
        </label>

        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product.description ?? ""}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-slate-800">
            Giá gốc
          </label>

          <input
            id="price"
            name="price"
            type="number"
            min="0"
            defaultValue={String(product.price)}
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="salePrice"
            className="text-sm font-medium text-slate-800"
          >
            Giá sale
          </label>

          <input
            id="salePrice"
            name="salePrice"
            type="number"
            min="0"
            defaultValue={
              product.sale_price === null ? "" : String(product.sale_price)
            }
            placeholder="Để trống nếu không sale"
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="stock" className="text-sm font-medium text-slate-800">
            Tồn kho
          </label>

          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={String(product.stock)}
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
            required
          />
        </div>
      </div>

      {message ? (
        <div
          className={
            isError
              ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              : "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          }
        >
          {message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}