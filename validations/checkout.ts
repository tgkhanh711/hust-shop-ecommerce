import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ tên không được vượt quá 100 ký tự."),

  phone: z
    .string()
    .trim()
    .min(9, "Số điện thoại không hợp lệ.")
    .max(15, "Số điện thoại không hợp lệ.")
    .regex(/^[0-9+\-\s]+$/, "Số điện thoại chỉ được chứa số, dấu + hoặc dấu -."),

  email: z
    .string()
    .trim()
    .email("Email không hợp lệ.")
    .max(150, "Email không được vượt quá 150 ký tự."),

  address: z
    .string()
    .trim()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự.")
    .max(300, "Địa chỉ không được vượt quá 300 ký tự."),

  note: z
    .string()
    .trim()
    .max(500, "Ghi chú không được vượt quá 500 ký tự.")
    .optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;