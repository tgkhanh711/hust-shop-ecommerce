import { redirect } from "next/navigation";

import { CheckoutContent } from "@/components/checkout/checkout-content";
import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Thanh toán | HUST Shop",
  description: "Nhập thông tin nhận hàng và kiểm tra đơn hàng của bạn.",
};

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `${routes.login}?message=${encodeURIComponent(
        "Vui lòng đăng nhập để thanh toán."
      )}&redirectTo=${encodeURIComponent(routes.checkout)}`
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, phone, address, email")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Checkout
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Thanh toán
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Kiểm tra giỏ hàng và nhập thông tin nhận hàng trước khi tạo đơn.
          </p>
        </div>

        <CheckoutContent
          userEmail={profile?.email ?? user.email ?? ""}
          initialFullName={profile?.full_name ?? user.user_metadata?.full_name ?? ""}
          initialPhone={profile?.phone ?? ""}
          initialAddress={profile?.address ?? ""}
        />
      </Container>
    </section>
  );
}