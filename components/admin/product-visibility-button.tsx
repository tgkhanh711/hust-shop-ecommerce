"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { updateProductVisibility } from "@/actions/admin-products";

type ProductVisibilityButtonProps = {
  productId: string;
  productName: string;
  isActive: boolean;
};

export function ProductVisibilityButton({
  productId,
  productName,
  isActive,
}: ProductVisibilityButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const nextIsActive = !isActive;

    const confirmed = window.confirm(
      nextIsActive
        ? `Bạn có chắc muốn hiện lại sản phẩm "${productName}" không?`
        : `Bạn có chắc muốn ẩn sản phẩm "${productName}" không?`
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await updateProductVisibility(productId, nextIsActive);

      window.alert(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={
        isActive
          ? "inline-flex h-9 items-center justify-center gap-2 rounded-full border border-amber-200 px-4 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex h-9 items-center justify-center gap-2 rounded-full border border-green-200 px-4 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}

      {isPending ? "Đang lưu..." : isActive ? "Ẩn" : "Hiện"}
    </button>
  );
}