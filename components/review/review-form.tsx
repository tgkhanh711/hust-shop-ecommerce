"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  createProductReview,
  type CreateReviewState,
} from "@/app/products/[slug]/actions";

type ReviewFormProps = {
  productId: string;
  productSlug: string;
};

const initialState: CreateReviewState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Đang gửi..." : "Gửi đánh giá"}
    </button>
  );
}

export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    createProductReview,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />

      <h3 className="text-lg font-bold text-slate-950">
        Viết đánh giá của bạn
      </h3>

      <div className="mt-5">
        <label
          htmlFor="rating"
          className="block text-sm font-semibold text-slate-900"
        >
          Số sao
        </label>

        <select
          id="rating"
          name="rating"
          defaultValue="5"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
        >
          <option value="5">5 sao - Rất tốt</option>
          <option value="4">4 sao - Tốt</option>
          <option value="3">3 sao - Bình thường</option>
          <option value="2">2 sao - Chưa tốt</option>
          <option value="1">1 sao - Tệ</option>
        </select>
      </div>

      <div className="mt-5">
        <label
          htmlFor="comment"
          className="block text-sm font-semibold text-slate-900"
        >
          Nội dung đánh giá
        </label>

        <textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="Ví dụ: Sản phẩm đẹp, chất vải tốt, giao hàng nhanh..."
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
        />
      </div>

      {state.message ? (
        <div
          className={
            state.success
              ? "mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              : "mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="mt-5">
        <SubmitButton />
      </div>
    </form>
  );
}