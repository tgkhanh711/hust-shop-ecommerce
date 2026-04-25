"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const createProductSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự."),
  slug: z
    .string()
    .min(2, "Slug phải có ít nhất 2 ký tự.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug chỉ dùng chữ thường, số và dấu gạch ngang."
    ),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục."),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự."),
  price: z.coerce.number().min(1000, "Giá sản phẩm phải lớn hơn 1.000đ."),
  salePrice: z.coerce.number().nullable(),
  stock: z.coerce.number().int().min(0, "Tồn kho không được âm."),
});

export type CreateProductResult = {
  success: boolean;
  message: string;
  productSlug?: string;
};

function createSafeFileName(fileName: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const randomPart = crypto.randomUUID();

  return `${randomPart}.${fileExtension}`;
}

export async function createProduct(
  formData: FormData
): Promise<CreateProductResult> {
  await requireAdmin();

  const imageFile = formData.get("image");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return {
      success: false,
      message: "Vui lòng chọn ảnh sản phẩm.",
    };
  }

  if (!imageFile.type.startsWith("image/")) {
    return {
      success: false,
      message: "File tải lên phải là ảnh.",
    };
  }

  const rawSalePrice = String(formData.get("salePrice") || "").trim();

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    price: formData.get("price"),
    salePrice: rawSalePrice === "" ? null : rawSalePrice,
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
    };
  }

  const supabase = await createClient();

  const fileName = createSafeFileName(imageFile.name);
  const filePath = `products/${parsed.data.slug}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, imageFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return {
      success: false,
      message: `Upload ảnh thất bại: ${uploadError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(filePath);

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parsed.data.price,
      sale_price: parsed.data.salePrice,
      stock: parsed.data.stock,
    })
    .select("id, slug")
    .single();

  if (productError) {
    await supabase.storage.from("product-images").remove([filePath]);

    return {
      success: false,
      message: `Tạo sản phẩm thất bại: ${productError.message}`,
    };
  }

  const { error: imageError } = await supabase.from("product_images").insert({
    product_id: product.id,
    image_url: publicUrl,
    alt_text: parsed.data.name,
    is_primary: true,
  });

  if (imageError) {
    return {
      success: false,
      message: `Lưu ảnh sản phẩm thất bại: ${imageError.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return {
    success: true,
    message: "Tạo sản phẩm thành công.",
    productSlug: product.slug,
  };
}
const postgresUuidSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Mã sản phẩm không hợp lệ."
  );

const updateProductSchema = z
  .object({
    productId: postgresUuidSchema,
    previousSlug: z.string().min(1),
    name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự."),
    slug: z
      .string()
      .min(2, "Slug phải có ít nhất 2 ký tự.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug chỉ dùng chữ thường, số và dấu gạch ngang."
      ),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục."),
    description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự."),
    price: z.coerce.number().min(1000, "Giá sản phẩm phải lớn hơn 1.000đ."),
    salePrice: z.coerce.number().nullable(),
    stock: z.coerce.number().int().min(0, "Tồn kho không được âm."),
  })
  .refine(
    (data) => data.salePrice === null || data.salePrice < data.price,
    {
      message: "Giá sale phải nhỏ hơn giá gốc.",
      path: ["salePrice"],
    }
  );

export type UpdateProductResult = {
  success: boolean;
  message: string;
};

export async function updateProduct(
  formData: FormData
): Promise<UpdateProductResult> {
  await requireAdmin();

  const rawSalePrice = String(formData.get("salePrice") || "").trim();

  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
    previousSlug: formData.get("previousSlug"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    price: formData.get("price"),
    salePrice: rawSalePrice === "" ? null : rawSalePrice,
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parsed.data.price,
      sale_price: parsed.data.salePrice,
      stock: parsed.data.stock,
    })
    .eq("id", parsed.data.productId);

  if (error) {
    return {
      success: false,
      message: `Cập nhật sản phẩm thất bại: ${error.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.previousSlug}`);
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/");

  return {
    success: true,
    message: "Cập nhật sản phẩm thành công.",
  };
}
const updateProductImageSchema = z.object({
  productId: postgresUuidSchema,
  productSlug: z
    .string()
    .min(2, "Slug sản phẩm không hợp lệ.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug chỉ dùng chữ thường, số và dấu gạch ngang."
    ),
  productName: z.string().min(2, "Tên sản phẩm không hợp lệ."),
});

export type UpdateProductImageResult = {
  success: boolean;
  message: string;
};

export async function updateProductImage(
  formData: FormData
): Promise<UpdateProductImageResult> {
  await requireAdmin();

  const imageFile = formData.get("image");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return {
      success: false,
      message: "Vui lòng chọn ảnh mới.",
    };
  }

  if (!imageFile.type.startsWith("image/")) {
    return {
      success: false,
      message: "File tải lên phải là ảnh.",
    };
  }

  const parsed = updateProductImageSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    productName: formData.get("productName"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
    };
  }

  const supabase = await createClient();

  const fileName = createSafeFileName(imageFile.name);
  const filePath = `products/${parsed.data.productSlug}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, imageFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return {
      success: false,
      message: `Upload ảnh mới thất bại: ${uploadError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(filePath);

  const { error: oldImagesError } = await supabase
    .from("product_images")
    .update({
      is_primary: false,
    })
    .eq("product_id", parsed.data.productId);

  if (oldImagesError) {
    return {
      success: false,
      message: `Cập nhật ảnh cũ thất bại: ${oldImagesError.message}`,
    };
  }

  const { error: newImageError } = await supabase.from("product_images").insert({
    product_id: parsed.data.productId,
    image_url: publicUrl,
    alt_text: parsed.data.productName,
    is_primary: true,
  });

  if (newImageError) {
    return {
      success: false,
      message: `Lưu ảnh mới thất bại: ${newImageError.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${parsed.data.productId}/edit`);
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.productSlug}`);
  revalidatePath("/");

  return {
    success: true,
    message: "Cập nhật ảnh sản phẩm thành công.",
  };
}
const deleteProductSchema = z.object({
  productId: postgresUuidSchema,
});

export type DeleteProductResult = {
  success: boolean;
  message: string;
};

function getStoragePathFromPublicUrl(publicUrl: string) {
  const marker = "/product-images/";
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const pathWithPossibleQuery = publicUrl.slice(markerIndex + marker.length);
  const cleanPath = pathWithPossibleQuery.split("?")[0];

  return decodeURIComponent(cleanPath);
}

export async function deleteProduct(
  productId: string
): Promise<DeleteProductResult> {
  await requireAdmin();

  const parsed = deleteProductSchema.safeParse({
    productId,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Mã sản phẩm không hợp lệ.",
    };
  }

  const supabase = await createClient();

  const { count: orderItemCount, error: orderItemError } = await supabase
    .from("order_items")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("product_id", parsed.data.productId);

  if (orderItemError) {
    return {
      success: false,
      message: `Không thể kiểm tra đơn hàng liên quan: ${orderItemError.message}`,
    };
  }

  if ((orderItemCount ?? 0) > 0) {
    return {
      success: false,
      message:
        "Không thể xóa sản phẩm này vì sản phẩm đã tồn tại trong đơn hàng. Ta sẽ làm chức năng ẩn sản phẩm ở bước sau.",
    };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      `
        id,
        slug,
        product_images (
          id,
          image_url
        )
      `
    )
    .eq("id", parsed.data.productId)
    .maybeSingle();

  if (productError) {
    return {
      success: false,
      message: `Không thể tải sản phẩm cần xóa: ${productError.message}`,
    };
  }

  if (!product) {
    return {
      success: false,
      message: "Không tìm thấy sản phẩm cần xóa.",
    };
  }

  const imagePaths =
    product.product_images
      ?.map((image) => getStoragePathFromPublicUrl(image.image_url))
      .filter((path): path is string => Boolean(path)) ?? [];

  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove(imagePaths);

    if (storageError) {
      return {
        success: false,
        message: `Xóa ảnh trong Storage thất bại: ${storageError.message}`,
      };
    }
  }

  const { error: imageDeleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", parsed.data.productId);

  if (imageDeleteError) {
    return {
      success: false,
      message: `Xóa dữ liệu ảnh thất bại: ${imageDeleteError.message}`,
    };
  }

  const { error: deleteProductError } = await supabase
    .from("products")
    .delete()
    .eq("id", parsed.data.productId);

  if (deleteProductError) {
    return {
      success: false,
      message: `Xóa sản phẩm thất bại: ${deleteProductError.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");

  return {
    success: true,
    message: "Xóa sản phẩm thành công.",
  };
}
const updateProductVisibilitySchema = z.object({
  productId: postgresUuidSchema,
  isActive: z.boolean(),
});

export type UpdateProductVisibilityResult = {
  success: boolean;
  message: string;
};

export async function updateProductVisibility(
  productId: string,
  isActive: boolean
): Promise<UpdateProductVisibilityResult> {
  await requireAdmin();

  const parsed = updateProductVisibilitySchema.safeParse({
    productId,
    isActive,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      is_active: parsed.data.isActive,
    })
    .eq("id", parsed.data.productId);

  if (error) {
    return {
      success: false,
      message: `Cập nhật trạng thái sản phẩm thất bại: ${error.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/search");

  return {
    success: true,
    message: parsed.data.isActive
      ? "Đã hiện sản phẩm."
      : "Đã ẩn sản phẩm.",
  };
}