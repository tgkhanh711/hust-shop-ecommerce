"use client";

import { FormEvent, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react";

import { createOrderAction } from "@/actions/order";
import { routes } from "@/constants/routes";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/validations/checkout";

type CheckoutContentProps = {
  userEmail: string;
  initialFullName: string;
  initialPhone: string;
  initialAddress: string;
};

type FormErrors = Partial<Record<keyof CheckoutFormValues, string>>;

const initialFormValues: CheckoutFormValues = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  note: "",
};

function getItemDisplayPrice(item: {
  price: number;
  salePrice: number | null;
}) {
  return item.salePrice ?? item.price;
}

export function CheckoutContent({
  userEmail,
  initialFullName,
  initialPhone,
  initialAddress,
}: CheckoutContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    ...initialFormValues,
    fullName: initialFullName,
    phone: initialPhone,
    email: userEmail,
    address: initialAddress,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const totalQuantity = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const subtotal = items.reduce((total, item) => {
    return total + getItemDisplayPrice(item) * item.quantity;
  }, 0);

  function updateField(field: keyof CheckoutFormValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));

    setServerError("");
    setSuccessMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setServerError("");
    setSuccessMessage("");

    const result = checkoutSchema.safeParse(formValues);

    if (!result.success) {
      const nextErrors: FormErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CheckoutFormValues;
        nextErrors[field] = issue.message;
      }

      setErrors(nextErrors);
      return;
    }

    if (items.length === 0) {
      setServerError("Giỏ hàng đang trống.");
      return;
    }

    startTransition(async () => {
      const orderResult = await createOrderAction({
        checkout: result.data,
        cartItems: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      if (!orderResult.success) {
        setServerError(orderResult.message);
        setErrors(orderResult.fieldErrors ?? {});
        return;
      }

      setErrors({});
      setSuccessMessage("Đặt hàng thành công. Đang chuyển trang...");
      clearCart();
      router.push(`/checkout/success?orderId=${orderResult.orderId}`);
    });
  }

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
          Chưa có sản phẩm để thanh toán
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Giỏ hàng của bạn đang trống. Hãy chọn sản phẩm trước khi đi tới trang
          thanh toán.
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
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="text-xl font-bold text-slate-950">
          Thông tin nhận hàng
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Nhập thông tin người nhận. Khi bấm đặt hàng, dữ liệu sẽ được gửi lên
          Server Action để tạo đơn trong Supabase.
        </p>

        <div className="mt-6 grid gap-5">
          <div>
            <label className="text-sm font-semibold text-slate-950">
              Họ và tên
            </label>

            <input
              value={formValues.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
            />

            {errors.fullName ? (
              <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-950">
                Số điện thoại
              </label>

              <input
                value={formValues.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Ví dụ: 0987654321"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
              />

              {errors.phone ? (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-950">
                Email
              </label>

              <input
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Ví dụ: ban@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
              />

              {errors.email ? (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-950">
              Địa chỉ nhận hàng
            </label>

            <textarea
              value={formValues.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Ví dụ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
            />

            {errors.address ? (
              <p className="mt-2 text-sm text-red-600">{errors.address}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-950">
              Ghi chú
            </label>

            <textarea
              value={formValues.note ?? ""}
              onChange={(event) => updateField("note", event.target.value)}
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
            />

            {errors.note ? (
              <p className="mt-2 text-sm text-red-600">{errors.note}</p>
            ) : null}
          </div>
        </div>

        {serverError ? (
          <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{serverError}</p>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <p>{successMessage}</p>
          </div>
        ) : null}

        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>
            Tổng tiền sẽ được server tính lại từ bảng products để tránh việc
            người dùng tự sửa giá trong localStorage.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Đang tạo đơn hàng..." : "Đặt hàng"}
        </button>
      </form>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-950">Tóm tắt đơn hàng</h2>

        <div className="mt-5 space-y-4">
          {items.map((item) => {
            const displayPrice = getItemDisplayPrice(item);

            return (
              <div
                key={item.id}
                className="grid grid-cols-[64px_1fr] gap-3 rounded-2xl bg-white p-3"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
                      No image
                    </div>
                  )}
                </div>

                <div>
                  <p className="line-clamp-2 text-sm font-semibold text-slate-950">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    SL: {item.quantity}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {formatPrice(displayPrice * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm">
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
            <span className="font-semibold text-slate-950">0 ₫</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <span className="text-base font-bold text-slate-950">Tổng tiền</span>
          <span className="text-xl font-bold text-slate-950">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Link
          href={routes.cart}
          className="mt-5 inline-flex w-full justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
        >
          Quay lại giỏ hàng
        </Link>
      </aside>
    </div>
  );
}