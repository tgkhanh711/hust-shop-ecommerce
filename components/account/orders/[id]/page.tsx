import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
};

type OrderDetail = {
  id: string;
  status: string;
  total_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  shipping_address: string | null;
  note: string | null;
  created_at: string;
  order_items: OrderItem[] | null;
};

type AccountOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Chờ xử lý";
    case "processing":
      return "Đang xử lý";
    case "shipped":
      return "Đang giao";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

function getStatusClassName(status: string) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "processing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "shipped":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export async function generateMetadata({
  params,
}: AccountOrderDetailPageProps) {
  const { id } = await params;

  return {
    title: `Đơn hàng #${id.slice(0, 8)} | HUST Shop`,
    description: "Xem chi tiết đơn hàng của bạn tại HUST Shop.",
  };
}

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `${routes.login}?message=${encodeURIComponent(
        "Vui lòng đăng nhập để xem đơn hàng."
      )}&redirectTo=${encodeURIComponent(`/account/orders/${id}`)}`
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      total_amount,
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      note,
      created_at,
      order_items (
        id,
        product_name,
        product_price,
        quantity,
        subtotal
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
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

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Không đọc được chi tiết đơn hàng.</p>
            <p className="mt-2">{error.message}</p>
          </div>
        </Container>
      </section>
    );
  }

  if (!data) {
    notFound();
  }

  const order = data as unknown as OrderDetail;
  const orderItems = order.order_items ?? [];

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
            Đơn hàng #{order.id.slice(0, 8)}
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Chi tiết đơn hàng bạn đã đặt tại HUST Shop.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Sản phẩm trong đơn
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Đặt lúc {formatDate(order.created_at)}
                </p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClassName(
                  order.status
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            {orderItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Đơn hàng này chưa có sản phẩm.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {item.product_name}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Đơn giá: {formatCurrency(item.product_price)}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          Số lượng: {item.quantity}
                        </p>
                      </div>

                      <p className="text-base font-bold text-slate-950">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
              <span className="text-sm font-semibold">Tổng tiền</span>
              <span className="text-xl font-bold">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </main>

          <aside className="h-fit space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Thông tin người nhận
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">Họ và tên</p>
                  <p className="mt-1 text-slate-600">
                    {order.customer_name ?? "Chưa có"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Số điện thoại</p>
                  <p className="mt-1 text-slate-600">
                    {order.customer_phone ?? "Chưa có"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p className="mt-1 break-all text-slate-600">
                    {order.customer_email ?? "Chưa có"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Địa chỉ nhận hàng
                  </p>
                  <p className="mt-1 leading-6 text-slate-600">
                    {order.shipping_address ?? "Chưa có"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Ghi chú</h2>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {order.note || "Đơn hàng này không có ghi chú."}
              </p>
            </div>

            <Link
              href={routes.products}
              className="inline-flex w-full justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Tiếp tục mua hàng
            </Link>
          </aside>
        </div>
      </Container>
    </section>
  );
}