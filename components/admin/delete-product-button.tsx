"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteProduct } from "@/actions/admin-products";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${productName}" không? Hành động này không thể hoàn tác.`
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProduct(productId);

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
      onClick={handleDelete}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-red-200 px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isPending ? "Đang xóa..." : "Xóa"}
    </button>
  );
}