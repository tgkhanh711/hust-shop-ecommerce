export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  thumbnailUrl: string | null;
  stock: number;
  quantity: number;
};

export type AddCartItemInput = Omit<CartItem, "quantity">;