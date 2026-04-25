"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type CreateReviewState = {
  success: boolean;
  message: string;
};

const createReviewSchema = z.object({
  productSlug: z.string().trim().min(1, "Slug sản phẩm không hợp lệ."),
  rating: z.coerce
    .number()
    .int("Số sao phải là số nguyên.")
    .min(1, "Vui lòng chọn ít nhất 1 sao.")
    .max(5, "Số sao tối đa là 5."),
  comment: z
    .string()
    .trim()
    .min(5, "Nội dung đánh giá phải có ít nhất 5 ký tự.")
    .max(500, "Nội dung đánh giá tối đa 500 ký tự."),
});

export async function createProductReview(
  _prevState: CreateReviewState,
  formData: FormData
): Promise<CreateReviewState> {
  const parsed = createReviewSchema.safeParse({
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  const { productSlug, rating, comment } = parsed.data;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "Bạn cần đăng nhập để gửi đánh giá.",
    };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug, is_active")
    .eq("slug", productSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (productError) {
    return {
      success: false,
      message: productError.message,
    };
  }

  if (!product) {
    return {
      success: false,
      message: "Không tìm thấy sản phẩm hoặc sản phẩm đã bị ẩn.",
    };
  }

  const { error: reviewError } = await supabase.from("reviews").insert({
    product_id: product.id,
    user_id: user.id,
    rating,
    comment,
  });

  if (reviewError) {
    return {
      success: false,
      message: reviewError.message,
    };
  }

  revalidatePath(`/products/${productSlug}`);

  return {
    success: true,
    message: "Gửi đánh giá thành công.",
  };
}