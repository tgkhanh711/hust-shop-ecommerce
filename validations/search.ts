import { z } from "zod";

export const searchQuerySchema = z
  .string()
  .trim()
  .max(100, "Từ khóa tìm kiếm không được vượt quá 100 ký tự.")
  .catch("");