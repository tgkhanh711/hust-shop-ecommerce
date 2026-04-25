"use client";

import { useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";

import type { AddCartItemInput } from "@/types/cart";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

type AddToCartButtonProps = {
  product: AddCartItemInput;
  className?: string;
};

export function AddToCartButton({
  product,
  className,
}: AddToCartButtonProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const addItem = useCartStore((state) => state.addItem);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const currentQuantity = useCartStore((state) => {
    return state.items.find((item) => item.id === product.id)?.quantity ?? 0;
  });

  const isOutOfStock = product.stock <= 0;
  const isMaxQuantity = hasHydrated && currentQuantity >= product.stock;

  function showFeedback(message: string) {
    setFeedbackMessage(message);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setFeedbackMessage("");
    }, 1800);
  }

  function handleAddToCart() {
    if (!hasHydrated) {
      return;
    }

    if (isOutOfStock) {
      showFeedback("Sản phẩm này hiện đã hết hàng.");
      return;
    }

    if (isMaxQuantity) {
      showFeedback("Bạn đã thêm tối đa số lượng tồn kho của sản phẩm này.");
      return;
    }

    addItem(product, 1);
    showFeedback(`Đã thêm "${product.name}" vào giỏ hàng.`);
  }

  let buttonLabel = "Thêm vào giỏ hàng";

  if (!hasHydrated) {
    buttonLabel = "Đang tải giỏ hàng...";
  } else if (isOutOfStock) {
    buttonLabel = "Hết hàng";
  } else if (isMaxQuantity) {
    buttonLabel = "Đã đạt số lượng tối đa";
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!hasHydrated || isOutOfStock || isMaxQuantity}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto",
          className
        )}
      >
        <ShoppingCart size={18} />
        {buttonLabel}
      </button>

      {hasHydrated && currentQuantity > 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Trong giỏ hàng hiện có{" "}
          <span className="font-semibold text-slate-950">
            {currentQuantity}
          </span>{" "}
          sản phẩm này.
        </p>
      ) : null}

      {feedbackMessage ? (
        <p className="mt-3 text-sm font-medium text-green-700">
          {feedbackMessage}
        </p>
      ) : null}
    </div>
  );
}