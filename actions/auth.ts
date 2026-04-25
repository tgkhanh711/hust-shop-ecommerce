"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/validations/auth";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value;
}

function getSafeRedirectPath(value: string) {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/")) {
    return null;
  }

  if (value.startsWith("//")) {
    return null;
  }

  return value;
}

function buildPathWithSearchParams(
  path: string,
  params: Record<string, string | null | undefined>
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();

  if (!queryString) {
    return path;
  }

  return `${path}?${queryString}`;
}

function redirectWithError(
  path: string,
  message: string,
  params?: Record<string, string | null | undefined>
): never {
  redirect(
    buildPathWithSearchParams(path, {
      ...params,
      error: message,
    })
  );
}

function redirectWithMessage(
  path: string,
  message: string,
  params?: Record<string, string | null | undefined>
): never {
  redirect(
    buildPathWithSearchParams(path, {
      ...params,
      message,
    })
  );
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: getFormString(formData, "fullName"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? "Thông tin đăng ký không hợp lệ.";

    redirectWithError(routes.register, firstError);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    redirectWithError(routes.register, error.message);
  }

  revalidatePath("/", "layout");

  redirectWithMessage(
    routes.login,
    "Đăng ký thành công. Hãy đăng nhập bằng tài khoản vừa tạo."
  );
}

export async function loginAction(formData: FormData) {
  const redirectTo = getSafeRedirectPath(getFormString(formData, "redirectTo"));

  const parsed = loginSchema.safeParse({
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? "Thông tin đăng nhập không hợp lệ.";

    redirectWithError(routes.login, firstError, {
      redirectTo,
    });
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirectWithError(routes.login, error.message, {
      redirectTo,
    });
  }

  revalidatePath("/", "layout");

  redirect(redirectTo ?? routes.products);
}

export async function logoutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  redirect(routes.login);
}