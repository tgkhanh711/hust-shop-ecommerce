"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type UpdateProfileState = {
  success: boolean;
  message: string;
};

const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(80, "Họ tên tối đa 80 ký tự."),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại tối đa 20 ký tự.")
    .optional(),
  address: z
    .string()
    .trim()
    .max(200, "Địa chỉ tối đa 200 ký tự.")
    .optional(),
});

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  const { fullName, phone, address } = parsed.data;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "Bạn cần đăng nhập để cập nhật tài khoản.",
    };
  }

  const { error: profileError } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      phone: phone || null,
      address: address || null,
    },
    {
      onConflict: "id",
    }
  );

  if (profileError) {
    return {
      success: false,
      message: profileError.message,
    };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
    },
  });

  if (authError) {
    return {
      success: false,
      message: authError.message,
    };
  }

  revalidatePath("/account");

  return {
    success: true,
    message: "Cập nhật thông tin tài khoản thành công.",
  };
}