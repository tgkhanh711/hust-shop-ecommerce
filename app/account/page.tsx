import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/account/profile-form";
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

type AccountOrder = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
};

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

export const metadata = {
  title: "Tài khoản | HUST Shop",
  description: "Quản lý thông tin tài khoản và lịch sử đơn hàng.",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(routes.login);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, phone, address, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      total_amount,
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<AccountOrder[]>();

  const orderList = orders ?? [];

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    "Chưa cập nhật";

  const displayEmail = profile?.email ?? user.email ?? "Chưa có email";

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Tài khoản của tôi
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Xem thông tin tài khoản, cập nhật hồ sơ cá nhân và kiểm tra lịch sử
            đơn hàng.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Thông tin tài khoản
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="font-semibold text-slate-900">Họ và tên</p>
                <p className="mt-1 text-slate-600">{displayName}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Email</p>
                <p className="mt-1 break-all text-slate-600">{displayEmail}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Vai trò</p>
                <p className="mt-1 text-slate-600">
                  {profile?.role === "admin" ? "Admin" : "Khách hàng"}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-950">
                Cập nhật hồ sơ
              </h3>

              <ProfileForm
                initialFullName={profile?.full_name ?? ""}
                initialPhone={profile?.phone ?? ""}
                initialAddress={profile?.address ?? ""}
              />
            </div>
          </aside>

          <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Lịch sử đơn hàng
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Bạn có {orderList.length} đơn hàng.
                </p>
              </div>

              <Link
                href={routes.products}
                className="inline-flex w-fit items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                Tiếp tục mua hàng
              </Link>
            </div>

            {ordersError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <p className="font-semibold">Không đọc được đơn hàng.</p>
                <p className="mt-2">{ordersError.message}</p>
              </div>
            ) : null}

            {!ordersError && orderList.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                <p>Bạn chưa có đơn hàng nào.</p>

                <Link
                  href={routes.products}
                  className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Xem sản phẩm
                </Link>
              </div>
            ) : null}

            {!ordersError && orderList.length > 0 ? (
              <div className="mt-6 space-y-5">
                {orderList.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Đơn hàng #{order.id.slice(0, 8)}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:items-end">
                        <span
                          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClassName(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>

                        <p className="text-base font-bold text-slate-950">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 rounded-xl bg-white p-4 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-950">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-slate-600">
                              {formatCurrency(item.product_price)} ×{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <p className="font-bold text-slate-950">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                                        <div className="mt-4 flex justify-end">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Xem chi tiết đơn hàng
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </main>
        </div>
      </Container>
    </section>
  );
}