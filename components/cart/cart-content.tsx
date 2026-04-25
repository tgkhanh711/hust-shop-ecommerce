"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { getProductDetailPath, routes } from "@/constants/routes";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

function getItemDisplayPrice(item: {
  price: number;
  salePrice: number | null;
}) {
  return item.salePrice ?? item.price;
}

export function CartContent() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalQuantity = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const subtotal = items.reduce((total, item) => {
    return total + getItemDisplayPrice(item) * item.quantity;
  }, 0);

  if (!hasHydrated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-600">
          Đang tải dữ liệu giỏ hàng...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
          <ShoppingBag size={24} />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-slate-950">
          Giỏ hàng của bạn đang trống
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Hãy quay lại trang sản phẩm, chọn một sản phẩm bạn thích và bấm nút
          thêm vào giỏ hàng.
        </p>

        <Link
          href={routes.products}
          className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => {
          const displayPrice = getItemDisplayPrice(item);
          const itemTotal = displayPrice * item.quantity;
          const isMaxQuantity = item.quantity >= item.stock;

          return (
            <article
              key={item.id}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr]"
            >
              <Link
                href={getProductDetailPath(item.slug)}
                className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"
              >
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
                    Chưa có ảnh
                  </div>
                )}
              </Link>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={getProductDetailPath(item.slug)}
                    className="font-semibold text-slate-950 transition hover:text-slate-700"
                  >
                    {item.name}
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-950">
                      {formatPrice(displayPrice)}
                    </span>

                    {item.salePrice !== null ? (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(item.price)}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    Tồn kho: {item.stock}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
                  >
                    <Trash2 size={16} />
                    Xóa sản phẩm
                  </button>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="flex w-fit items-center rounded-full border border-slate-200">
                    <button
                      type="button"
                      onClick={() => decreaseItem(item.id)}
                      className="flex h-9 w-9 items-center justify-center text-slate-700 transition hover:text-slate-950"
                      aria-label="Giảm số lượng"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="min-w-10 text-center text-sm font-semibold text-slate-950">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseItem(item.id)}
                      disabled={isMaxQuantity}
                      className="flex h-9 w-9 items-center justify-center text-slate-700 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
                      aria-label="Tăng số lượng"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {isMaxQuantity ? (
                    <p className="text-xs font-medium text-amber-700">
                      Đã đạt tồn kho tối đa
                    </p>
                  ) : null}

                  <p className="text-sm text-slate-600">
                    Thành tiền:{" "}
                    <span className="font-bold text-slate-950">
                      {formatPrice(itemTotal)}
                    </span>
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-950">Tóm tắt đơn hàng</h2>

        <div className="mt-5 space-y-3 border-b border-slate-200 pb-5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Tổng số lượng</span>
            <span className="font-semibold text-slate-950">
              {totalQuantity}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Tạm tính</span>
            <span className="font-semibold text-slate-950">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">Phí vận chuyển</span>
            <span className="font-semibold text-slate-950">
              Tính ở bước sau
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-base font-bold text-slate-950">Tổng tiền</span>
          <span className="text-xl font-bold text-slate-950">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Link
          href={routes.checkout}
          className="mt-6 inline-flex w-full justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Tiến hành thanh toán
        </Link>

        <button
          type="button"
          onClick={clearCart}
          className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600"
        >
          Xóa toàn bộ giỏ hàng
        </button>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Dữ liệu giỏ hàng hiện được lưu trong localStorage. Khi làm checkout,
          ta sẽ gửi dữ liệu này lên Server Action để tạo đơn hàng.
        </p>
      </aside>
    </div>
  );
}