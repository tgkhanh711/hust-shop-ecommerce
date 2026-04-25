import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { routes } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

import { Container } from "./container";

const mainNavLinks = [
  {
    label: "Trang chủ",
    href: routes.home,
  },
  {
    label: "Sản phẩm",
    href: routes.products,
  },
  {
    label: "Tìm kiếm",
    href: routes.search,
  },
  {
    label: "Giỏ hàng",
    href: routes.cart,
  },
];

type UserProfile = {
  full_name: string | null;
  role: string | null;
};

export async function SiteHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle<UserProfile>();

    profile = data;
  }

  const isAdmin = profile?.role === "admin";

  const displayName =
    profile?.full_name ??
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : user?.email ?? "Tài khoản");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-3">
        <Link
          href={routes.home}
          className="shrink-0 text-lg font-black tracking-tight text-slate-950"
        >
          HUST Shop
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}

          {isAdmin ? (
            <Link
              href={routes.admin}
              className="text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={routes.account}
                className="hidden max-w-40 truncate rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 sm:inline-flex"
                title={displayName}
              >
                {displayName}
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Đăng xuất
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href={routes.login}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                Đăng nhập
              </Link>

              <Link
                href={routes.register}
                className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </Container>

      <div className="border-t border-slate-100 md:hidden">
        <Container className="flex gap-4 overflow-x-auto py-3">
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <Link
              href={routes.account}
              className="shrink-0 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              Tài khoản
            </Link>
          ) : null}

          {isAdmin ? (
            <Link
              href={routes.admin}
              className="shrink-0 text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Admin
            </Link>
          ) : null}
        </Container>
      </div>
    </header>
  );
}