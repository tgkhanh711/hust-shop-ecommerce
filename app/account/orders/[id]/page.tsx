import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type OrderRow = {
  id: string;
  user_id: string | null;
  status: string | null;
  created_at: string | null;

  total_amount?: number | null;
  total_price?: number | null;
  subtotal?: number | null;
  shipping_fee?: number | null;

  customer_name?: string | null;
  full_name?: string | null;

  customer_phone?: string | null;
  phone?: string | null;

  customer_email?: string | null;
  email?: string | null;

  customer_address?: string | null;
  shipping_address?: string | null;
  address?: string | null;

  note?: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;

  product_name?: string | null;
  name?: string | null;

  product_price?: number | null;
  price?: number | null;

  quantity: number | null;
  subtotal?: number | null;
};

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có dữ liệu";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getOrderTotal(order: OrderRow, items: OrderItemRow[]) {
  const savedTotal = Number(order.total_amount ?? order.total_price ?? 0);

  if (savedTotal > 0) {
    return savedTotal;
  }

  return items.reduce((total, item) => {
    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.product_price ?? item.price ?? 0);
    const subtotal = Number(item.subtotal ?? price * quantity);

    return total + subtotal;
  }, 0);
}

function getCustomerName(order: OrderRow) {
  return order.customer_name ?? order.full_name ?? "Chưa có dữ liệu";
}

function getCustomerPhone(order: OrderRow) {
  return order.customer_phone ?? order.phone ?? "Chưa có dữ liệu";
}

function getCustomerEmail(order: OrderRow) {
  return order.customer_email ?? order.email ?? "Chưa có dữ liệu";
}

function getCustomerAddress(order: OrderRow) {
  return (
    order.customer_address ??
    order.shipping_address ??
    order.address ??
    "Chưa có dữ liệu"
  );
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return {
    title: `Chi tiết đơn hàng ${id.slice(0, 8)} | HUST Shop`,
    description: "Xem chi tiết đơn hàng của bạn tại HUST Shop.",
  };
}

export default async function AccountOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Vui lòng đăng nhập để xem chi tiết đơn hàng."
      )}&redirectTo=${encodeURIComponent(`/account/orders/${id}`)}`
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (orderError) {
    return (
      <section className="bg-white">
        <Container className="py-12 sm:py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-semibold">Không đọc được đơn hàng.</p>
            <p className="mt-2">{orderError.message}</p>
          </div>
        </Container>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="bg-white">
        <Container className="py-12 sm:py-16">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h1 className="text-2xl font-bold text-slate-950">
              Không tìm thấy đơn hàng
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Đơn hàng này không tồn tại hoặc không thuộc tài khoản đang đăng
              nhập.
            </p>

            <Link
              href="/account"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Quay lại tài khoản
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  const typedOrder = order as OrderRow;

  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", typedOrder.id);

  const items = (orderItems ?? []) as OrderItemRow[];
  const orderTotal = getOrderTotal(typedOrder, items);

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            ← Quay lại tài khoản
          </Link>
        </div>

        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Order Detail
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Chi tiết đơn hàng
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Xem thông tin người nhận và các sản phẩm trong đơn hàng của bạn.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                Thông tin đơn hàng
              </h2>

              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-slate-500">Mã đơn hàng</p>
                  <p className="mt-1 break-all font-semibold text-slate-950">
                    {typedOrder.id}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Ngày đặt</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatDate(typedOrder.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Trạng thái</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {typedOrder.status ?? "pending"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Tổng tiền</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatCurrency(orderTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                Sản phẩm trong đơn
              </h2>

              {orderItemsError ? (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">
                    Không đọc được sản phẩm trong đơn hàng.
                  </p>
                  <p className="mt-2">{orderItemsError.message}</p>
                </div>
              ) : null}

              {!orderItemsError && items.length === 0 ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Đơn hàng này chưa có sản phẩm.
                </div>
              ) : null}

              {!orderItemsError && items.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                        <th className="px-4 py-3 font-semibold">Số lượng</th>
                        <th className="px-4 py-3 font-semibold">Đơn giá</th>
                        <th className="px-4 py-3 font-semibold">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {items.map((item) => {
                        const quantity = Number(item.quantity ?? 0);
                        const price = Number(
                          item.product_price ?? item.price ?? 0
                        );
                        const subtotal = Number(
                          item.subtotal ?? price * quantity
                        );

                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-4 font-semibold text-slate-950">
                              {item.product_name ??
                                item.name ??
                                "Sản phẩm không có tên"}
                            </td>

                            <td className="px-4 py-4 text-slate-700">
                              {quantity}
                            </td>

                            <td className="px-4 py-4 text-slate-700">
                              {formatCurrency(price)}
                            </td>

                            <td className="px-4 py-4 font-semibold text-slate-950">
                              {formatCurrency(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Thông tin nhận hàng
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Người nhận</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {getCustomerName(typedOrder)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Số điện thoại</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {getCustomerPhone(typedOrder)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Email</p>
                <p className="mt-1 break-all font-semibold text-slate-950">
                  {getCustomerEmail(typedOrder)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Địa chỉ</p>
                <p className="mt-1 font-semibold leading-6 text-slate-950">
                  {getCustomerAddress(typedOrder)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Ghi chú</p>
                <p className="mt-1 leading-6 text-slate-700">
                  {typedOrder.note || "Không có ghi chú."}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Tổng thanh toán</span>
                <span className="text-xl font-bold text-slate-950">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}