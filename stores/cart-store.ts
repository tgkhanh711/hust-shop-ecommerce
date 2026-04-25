"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AddCartItemInput, CartItem } from "@/types/cart";

type CartStore = {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addItem: (product: AddCartItemInput, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getTotalPrice: () => number;
};

function getDisplayPrice(item: CartItem) {
  return item.salePrice ?? item.price;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) {
          return;
        }

        const safeQuantity = Math.max(1, quantity);

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) => {
                if (item.id !== product.id) {
                  return item;
                }

                return {
                  ...item,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  salePrice: product.salePrice,
                  thumbnailUrl: product.thumbnailUrl,
                  stock: product.stock,
                  quantity: Math.min(
                    item.quantity + safeQuantity,
                    product.stock
                  ),
                };
              }),
            };
          }

          const newItem: CartItem = {
            ...product,
            quantity: Math.min(safeQuantity, product.stock),
          };

          return {
            items: [...state.items, newItem],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      increaseItem: (productId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== productId) {
              return item;
            }

            return {
              ...item,
              quantity: Math.min(item.quantity + 1, item.stock),
            };
          }),
        }));
      },

      decreaseItem: (productId) => {
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.id !== productId) {
              return [item];
            }

            const nextQuantity = item.quantity - 1;

            if (nextQuantity <= 0) {
              return [];
            }

            return [
              {
                ...item,
                quantity: nextQuantity,
              },
            ];
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalQuantity: () => {
        return get().items.reduce((total, item) => {
          return total + item.quantity;
        }, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + getDisplayPrice(item) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "hust-shop-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    }
  )
);