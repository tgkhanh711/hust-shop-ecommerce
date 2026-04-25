import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Container } from "@/components/layout/container";
import { getCategoryDetailPath, routes } from "@/constants/routes";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/review/review-form";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  sku: string | null;
  thumbnail_url: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
  images: ProductImage[] | null;
};

type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function clampRating(rating: number) {
  return Math.max(0, Math.min(5, rating));
}

function formatReviewDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description, thumbnail_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm | HUST Shop",
    };
  }

  return {
    title: `${product.name} | HUST Shop`,
    description:
      product.description ?? `Xem chi tiết sản phẩm ${product.name}.`,
    openGraph: {
      title: `${product.name} | HUST Shop`,
      description:
        product.description ?? `Xem chi tiết sản phẩm ${product.name}.`,
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        sale_price,
        stock,
        sku,
        thumbnail_url,
        category:categories (
          name,
          slug
        ),
        images:product_images (
          id,
          image_url,
          alt_text,
          sort_order,
          is_primary
        )
      `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return (
      <section className="bg-white">
        <Container className="py-12 sm:py-16">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Không đọc được chi tiết sản phẩm.</p>
            <p className="mt-2">{error.message}</p>
          </div>
        </Container>
      </section>
    );
  }

  if (!data) {
    notFound();
  }

  const rawProduct = data as unknown as Omit<ProductDetail, "category"> & {
    category:
      | {
          name: string;
          slug: string;
        }
      | {
          name: string;
          slug: string;
        }[]
      | null;
  };

  const product: ProductDetail = {
    ...rawProduct,
    category: Array.isArray(rawProduct.category)
      ? rawProduct.category[0] ?? null
      : rawProduct.category,
  };

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })
    .returns<ProductReview[]>();

  const reviewList = reviews ?? [];

  const {
  data: { user },
} = await supabase.auth.getUser();

  const averageRating =
    reviewList.length > 0
      ? reviewList.reduce((total, review) => total + review.rating, 0) /
        reviewList.length
      : 0;

  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const primaryImage =
    sortedImages.find((image) => image.is_primary) ?? sortedImages[0];

  const imageUrl = primaryImage?.image_url ?? product.thumbnail_url;
  const imageAlt = primaryImage?.alt_text ?? product.name;

  const displayPrice = product.sale_price ?? product.price;
  const hasSalePrice = product.sale_price !== null;

  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8">
          <Link
            href={routes.products}
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                  Chưa có ảnh sản phẩm
                </div>
              )}
            </div>

            {sortedImages.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {sortedImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text ?? product.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:pt-4">
            {product.category ? (
              <Link
                href={getCategoryDetailPath(product.category.slug)}
                className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-950"
              >
                {product.category.name}
              </Link>
            ) : (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Sản phẩm
              </p>
            )}

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-slate-950">
                {formatPrice(displayPrice)}
              </span>

              {hasSalePrice ? (
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <div className="rounded-full border border-slate-200 px-4 py-2 text-slate-700">
                Tồn kho: <span className="font-semibold">{product.stock}</span>
              </div>

              {product.sku ? (
                <div className="rounded-full border border-slate-200 px-4 py-2 text-slate-700">
                  SKU: <span className="font-semibold">{product.sku}</span>
                </div>
              ) : null}
            </div>

            <AddToCartButton
              className="mt-8"
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                salePrice: product.sale_price,
                thumbnailUrl: imageUrl ?? product.thumbnail_url,
                stock: product.stock,
              }}
            />

            <div className="mt-8 border-t border-slate-200 pt-8">
              <h2 className="text-lg font-bold text-slate-950">
                Mô tả sản phẩm
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {product.description ?? "Sản phẩm chưa có mô tả."}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">
                Trạng thái hiện tại
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Trang chi tiết sản phẩm đang đọc dữ liệu thật từ Supabase.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Đánh giá sản phẩm
            </h2>

            {reviewList.length > 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                Trung bình{" "}
                <span className="font-semibold text-slate-950">
                  {averageRating.toFixed(1)}/5
                </span>{" "}
                từ{" "}
                <span className="font-semibold text-slate-950">
                  {reviewList.length}
                </span>{" "}
                đánh giá.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                Sản phẩm này chưa có đánh giá.
              </p>
            )}
          </div>

          {reviewsError ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Không thể tải đánh giá: {reviewsError.message}
            </div>
          ) : null}

          {!reviewsError && reviewList.length > 0 ? (
            <div className="mt-6 space-y-4">
              {reviewList.map((review) => {
                const safeRating = clampRating(review.rating);

                return (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                        {"★".repeat(safeRating)}
                        <span className="text-slate-300">
                          {"★".repeat(5 - safeRating)}
                        </span>
                      </div>

                      <time className="text-xs text-slate-500">
                        {formatReviewDate(review.created_at)}
                      </time>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {review.comment ||
                        "Người dùng chưa để lại nội dung đánh giá."}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : null}
          {user ? (
  <ReviewForm productId={product.id} productSlug={product.slug} />
) : (
  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
    Bạn cần{" "}
    <Link
      href={routes.login}
      className="font-semibold underline underline-offset-4"
    >
      đăng nhập
    </Link>{" "}
    để gửi đánh giá sản phẩm.
  </div>
)}
        </section>
      </Container>
    </section>
  );
}