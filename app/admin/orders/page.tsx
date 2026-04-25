import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | HUST Shop",
  description: "Trang quản lý danh sách đơn hàng của HUST Shop.",
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string | null;
  product_price: number | string | null;
  unit_price: number | string | null;
  quantity: number;
  subtotal: number | string | null;
  total_price: number | string | null;
};

type AdminOrder = {
  id: string;
  status: string;
  total_amount: number | string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  customer_address: string | null;
  note: string | null;
  created_at: string;
  order_items: OrderItem[];
};

function formatCurrency(value: number | string | null) {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrdersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        status,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        customer_address,
        note,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          unit_price,
          quantity,
          subtotal,
          total_price
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Không thể tải danh sách đơn hàng: {error.message}
        </div>
      </main>
    );
  }

  const orderList = (orders ?? []) as AdminOrder[];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Admin Dashboard
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            <ReceiptText className="h-4 w-4" />
            Quản lý đơn hàng
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Danh sách đơn hàng
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Hiện có {orderList.length} đơn hàng trong hệ thống.
          </p>
        </div>

        {orderList.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-medium text-slate-900">Chưa có đơn hàng nào</p>
            <p className="mt-1 text-sm text-slate-600">
              Khi khách đặt hàng thành công, đơn hàng sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {orderList.map((order) => {
              const address =
                order.shipping_address || order.customer_address || "Chưa có địa chỉ";

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-bold text-slate-950">
                          Đơn hàng #{order.id.slice(0, 8)}
                        </h2>

                                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                                  
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Tạo lúc: {formatDate(order.created_at)}
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-400">
                        ID đầy đủ: {order.id}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm text-slate-500">Tổng tiền</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
                    <div className="rounded-2xl bg-white p-4">
                      <h3 className="font-semibold text-slate-950">
                        Thông tin khách hàng
                      </h3>

                      <div className="mt-4 space-y-3 text-sm">
                        <div>
                          <p className="text-slate-500">Họ tên</p>
                          <p className="mt-1 font-medium text-slate-950">
                            {order.customer_name || "Chưa có tên"}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Email</p>
                          <p className="mt-1 font-medium text-slate-950">
                            {order.customer_email || "Chưa có email"}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Số điện thoại</p>
                          <p className="mt-1 font-medium text-slate-950">
                            {order.customer_phone || "Chưa có số điện thoại"}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Địa chỉ</p>
                          <p className="mt-1 font-medium leading-6 text-slate-950">
                            {address}
                          </p>
                        </div>

                        {order.note ? (
                          <div>
                            <p className="text-slate-500">Ghi chú</p>
                            <p className="mt-1 font-medium leading-6 text-slate-950">
                              {order.note}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <h3 className="font-semibold text-slate-950">
                        Sản phẩm trong đơn
                      </h3>

                      {order.order_items.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">
                          Đơn này chưa có sản phẩm trong bảng order_items.
                        </p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full min-w-130 text-left text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500">
                                <th className="px-3 py-2 font-semibold">
                                  Sản phẩm
                                </th>
                                <th className="px-3 py-2 font-semibold">
                                  Đơn giá
                                </th>
                                <th className="px-3 py-2 font-semibold">SL</th>
                                <th className="px-3 py-2 font-semibold">
                                  Tạm tính
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {order.order_items.map((item) => {
                                const itemPrice =
                                  item.product_price ?? item.unit_price;
                                const itemSubtotal =
                                  item.subtotal ?? item.total_price;

                                return (
                                  <tr
                                    key={item.id}
                                    className="border-b border-slate-100 last:border-b-0"
                                  >
                                    <td className="px-3 py-3">
                                      <p className="font-medium text-slate-950">
                                        {item.product_name || "Sản phẩm"}
                                      </p>
                                      {item.product_id ? (
                                        <p className="mt-1 break-all text-xs text-slate-400">
                                          {item.product_id}
                                        </p>
                                      ) : null}
                                    </td>

                                    <td className="px-3 py-3 text-slate-700">
                                      {formatCurrency(itemPrice)}
                                    </td>

                                    <td className="px-3 py-3 text-slate-700">
                                      {item.quantity}
                                    </td>

                                    <td className="px-3 py-3 font-semibold text-slate-950">
                                      {formatCurrency(itemSubtotal)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}