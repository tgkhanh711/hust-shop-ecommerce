import Link from "next/link";

import { registerAction } from "@/actions/auth";
import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata = {
  title: "Đăng ký | HUST Shop",
  description: "Tạo tài khoản HUST Shop.",
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { error, message } = await searchParams;

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Register
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Tạo tài khoản
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Đăng ký tài khoản để chuẩn bị cho chức năng đặt hàng và quản lý
              thông tin cá nhân.
            </p>
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
            action={registerAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-slate-950"
                >
                  Họ và tên
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                />
              </div>

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
                  placeholder="Tối thiểu 6 ký tự"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-slate-950"
                >
                  Nhập lại mật khẩu
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Nhập lại mật khẩu"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Đăng ký
            </button>

            <p className="mt-5 text-center text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <Link
                href={routes.login}
                className="font-semibold text-slate-950 underline-offset-4 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}