import Link from "next/link";

import { loginAction } from "@/actions/auth";
import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirectTo?: string;
  }>;
};

export const metadata = {
  title: "Đăng nhập | HUST Shop",
  description: "Đăng nhập tài khoản HUST Shop.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, redirectTo } = await searchParams;

  const safeRedirectTo =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
      ? redirectTo
      : "";

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Login
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Đăng nhập
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Đăng nhập để tiếp tục đặt hàng và quản lý tài khoản.
            </p>
            {safeRedirectTo ? (
  <p className="mt-3 text-sm font-medium text-slate-700">
    Sau khi đăng nhập, bạn sẽ được đưa lại trang đang cần truy cập.
  </p>
) : null}
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          <form
            action={loginAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            {safeRedirectTo ? (
  <input type="hidden" name="redirectTo" value={safeRedirectTo} />
) : null}
            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-950"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ban@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-950"
                >
                  Mật khẩu
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Đăng nhập
            </button>

            <p className="mt-5 text-center text-sm text-slate-600">
              Chưa có tài khoản?{" "}
              <Link
                href={routes.register}
                className="font-semibold text-slate-950 underline-offset-4 hover:underline"
              >
                Đăng ký
              </Link>
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}