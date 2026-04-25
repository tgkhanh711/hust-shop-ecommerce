"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateProductImage } from "@/actions/admin-products";

type UpdateProductImageFormProps = {
  productId: string;
  productSlug: string;
  productName: string;
  currentImageUrl?: string | null;
  currentImageAlt?: string | null;
};

export function UpdateProductImageForm({
  productId,
  productSlug,
  productName,
  currentImageUrl,
  currentImageAlt,
}: UpdateProductImageFormProps) {
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const result = await updateProductImage(formData);

      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-950">
          Ảnh sản phẩm
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Upload ảnh mới để thay ảnh chính đang hiển thị ngoài website.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[180px_1fr]">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-800">
            Ảnh hiện tại
          </p>

          <div className="relative h-44 w-44 overflow-hidden rounded-2xl bg-slate-100">
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt={currentImageAlt || productName}
                fill
                sizes="176px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                Chưa có ảnh
              </div>
            )}
          </div>
        </div>

        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="productSlug" value={productSlug} />
          <input type="hidden" name="productName" value={productName} />

          <div className="space-y-2">
            <label
              htmlFor="image"
              className="text-sm font-medium text-slate-800"
            >
              Chọn ảnh mới
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
            {isPending ? "Đang upload ảnh..." : "Cập nhật ảnh"}
          </button>
        </form>
      </div>
    </section>
  );
}