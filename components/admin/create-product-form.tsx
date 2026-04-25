"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createProduct } from "@/actions/admin-products";

type CategoryOption = {
  id: string;
  name: string;
};

type CreateProductFormProps = {
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

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const suggestedSlug = useMemo(() => createSlug(name), [name]);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(createSlug(value));
  }

  function handleSubmit(formData: FormData) {
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const result = await createProduct(formData);

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
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-slate-800"
          >
            Tên sản phẩm
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Ví dụ: Áo thun nam basic"
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="slug"
            className="text-sm font-medium text-slate-800"
          >
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(createSlug(event.target.value))}
            placeholder="ao-thun-nam-basic"
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
            required
          />
          {suggestedSlug ? (
            <p className="text-xs text-slate-500">
              URL sản phẩm: /products/{slug}
            </p>
          ) : null}
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
          placeholder="Nhập mô tả sản phẩm..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="price"
            className="text-sm font-medium text-slate-800"
          >
            Giá gốc
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            placeholder="299000"
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
            placeholder="Để trống nếu không sale"
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="stock"
            className="text-sm font-medium text-slate-800"
          >
            Tồn kho
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            placeholder="20"
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="image"
          className="text-sm font-medium text-slate-800"
        >
          Ảnh sản phẩm
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          required
        />
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

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Đang tạo sản phẩm..." : "Tạo sản phẩm"}
      </button>
    </form>
  );
}