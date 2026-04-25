"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const postgresUuidSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Mã đơn hàng không hợp lệ."
  );

const updateOrderStatusSchema = z.object({
  orderId: postgresUuidSchema,
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
});

export type UpdateOrderStatusResult = {
  success: boolean;
  message: string;
};

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<UpdateOrderStatusResult> {
  const parsed = updateOrderStatusSchema.safeParse({
    orderId,
    status,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
    };
  }

  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      status: parsed.data.status,
    })
    .eq("id", parsed.data.orderId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/orders");

  return {
    success: true,
    message: "Cập nhật trạng thái đơn hàng thành công.",
  };
}