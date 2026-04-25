import Image from "next/image";
import Link from "next/link";

import { getProductDetailPath } from "@/constants/routes";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    stock: number;
    thumbnail_url: string | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const productHref = getProductDetailPath(product.slug);
  const displayPrice = product.sale_price ?? product.price;
  const hasSalePrice = product.sale_price !== null;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={productHref} className="block">
        <div className="relative aspect-square bg-slate-100">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
              Chưa có ảnh
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="min-h-12 text-base font-semibold leading-6 text-slate-950 transition hover:text-slate-700">
            {product.name}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-slate-950">
              {formatPrice(displayPrice)}
            </span>

            {hasSalePrice ? (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Còn hàng: {product.stock}
          </p>
        </div>
      </Link>
    </article>
  );
}