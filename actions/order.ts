"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/validations/checkout";

const postgresUuidSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Sản phẩm không hợp lệ."
  );

const createOrderCartItemSchema = z.object({
  productId: postgresUuidSchema,
  quantity: z
    .number()
    .int("Số lượng phải là số nguyên.")
    .min(1, "Số lượng phải lớn hơn hoặc bằng 1."),
});

const createOrderSchema = z.object({
  checkout: checkoutSchema,
  cartItems: z
    .array(createOrderCartItemSchema)
    .min(1, "Giỏ hàng đang trống."),
});

type CreateOrderInput = {
  checkout: CheckoutFormValues;
  cartItems: {
    productId: string;
    quantity: number;
  }[];
};

type CreateOrderResult =
  | {
      success: true;
      orderId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof CheckoutFormValues, string>>;
    };

function getProductDisplayPrice(product: {
  price: number;
  sale_price: number | null;
}) {
  return product.sale_price ?? product.price;
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};

    for (const issue of parsed.error.issues) {
      const firstPath = issue.path[0];
      const secondPath = issue.path[1];

      if (firstPath === "checkout" && typeof secondPath === "string") {
        fieldErrors[secondPath as keyof CheckoutFormValues] = issue.message;
      }
    }

    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Dữ liệu đặt hàng không hợp lệ.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Bạn cần đăng nhập trước khi đặt hàng.",
    };
  }

  const productIds = parsed.data.cartItems.map((item) => item.productId);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, sale_price, stock")
    .in("id", productIds);

  if (productsError) {
    return {
      success: false,
      message: productsError.message,
    };
  }

  if (!products || products.length !== productIds.length) {
    return {
      success: false,
      message:
        "Một số sản phẩm trong giỏ hàng không còn tồn tại. Hãy quay lại giỏ hàng và kiểm tra lại.",
    };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  let totalAmount = 0;

  const orderItems = parsed.data.cartItems.map((cartItem) => {
    const product = productMap.get(cartItem.productId);

    if (!product) {
      throw new Error("Sản phẩm không tồn tại.");
    }

    if (product.stock < cartItem.quantity) {
      throw new Error(
        `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho.`
      );
    }

    const unitPrice = getProductDisplayPrice(product);
    const totalPrice = unitPrice * cartItem.quantity;

    totalAmount += totalPrice;

    return {
      product,
      quantity: cartItem.quantity,
      unitPrice,
      totalPrice,
    };
  });

  const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({
    user_id: user.id,
    status: "pending",
    customer_name: parsed.data.checkout.fullName,
    customer_email: parsed.data.checkout.email,
    customer_phone: parsed.data.checkout.phone,
    shipping_address: parsed.data.checkout.address,
    customer_address: parsed.data.checkout.address,
    note: parsed.data.checkout.note || null,
    total_amount: totalAmount,
  })
  .select("id")
  .single();

  if (orderError) {
    return {
      success: false,
      message: orderError.message,
    };
  }

  const orderItemRows = orderItems.map((item) => ({
  order_id: order.id,
  product_id: item.product.id,
  product_name: item.product.name,
  product_price: item.unitPrice,
  quantity: item.quantity,
  unit_price: item.unitPrice,
  total_price: item.totalPrice,
  subtotal: item.totalPrice,
}));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItemRows);

  if (orderItemsError) {
    return {
      success: false,
      message: orderItemsError.message,
    };
  }

  return {
    success: true,
    orderId: order.id,
  };
}