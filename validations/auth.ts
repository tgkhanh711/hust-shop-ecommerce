import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ.")
    .max(150, "Email không được vượt quá 150 ký tự."),

  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự.")
      .max(100, "Họ tên không được vượt quá 100 ký tự."),

    email: z
      .string()
      .trim()
      .email("Email không hợp lệ.")
      .max(150, "Email không được vượt quá 150 ký tự."),

    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
      .max(100, "Mật khẩu không được vượt quá 100 ký tự."),

    confirmPassword: z
      .string()
      .min(6, "Mật khẩu xác nhận phải có ít nhất 6 ký tự.")
      .max(100, "Mật khẩu xác nhận không được vượt quá 100 ký tự."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;