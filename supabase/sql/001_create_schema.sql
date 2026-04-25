-- =========================================================
-- HUST Shop E-commerce Database Schema
-- Next.js + Supabase
-- =========================================================

-- 1. Extension để dùng gen_random_uuid()
create extension if not exists "pgcrypto";

-- =========================================================
-- 2. Xóa bảng cũ nếu bạn chạy lại trong lúc học
-- Lưu ý: các lệnh này sẽ xóa dữ liệu cũ nếu bảng đã tồn tại.
-- =========================================================

drop table if exists public.reviews cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.users cascade;

-- =========================================================
-- 3. Bảng categories
-- Lưu danh mục sản phẩm: Áo, Quần, Giày, Phụ kiện...
-- =========================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_name_length check (char_length(name) >= 2),
  constraint categories_slug_length check (char_length(slug) >= 2)
);

-- =========================================================
-- 4. Bảng users
-- Lưu profile public của user, liên kết với auth.users của Supabase
-- =========================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint users_role_check check (role in ('customer', 'admin'))
);

-- =========================================================
-- 5. Bảng products
-- Lưu sản phẩm chính
-- =========================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null,
  sale_price numeric(12, 2),
  stock integer not null default 0,
  sku text unique,
  thumbnail_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_name_length check (char_length(name) >= 2),
  constraint products_slug_length check (char_length(slug) >= 2),
  constraint products_price_check check (price >= 0),
  constraint products_sale_price_check check (sale_price is null or sale_price >= 0),
  constraint products_stock_check check (stock >= 0)
);

-- =========================================================
-- 6. Bảng product_images
-- Một sản phẩm có thể có nhiều ảnh
-- =========================================================

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),

  constraint product_images_sort_order_check check (sort_order >= 0)
);

-- =========================================================
-- 7. Bảng orders
-- Lưu đơn hàng
-- =========================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,

  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  note text,

  total_amount numeric(12, 2) not null default 0,
  status text not null default 'pending',
  payment_method text not null default 'cod',
  payment_status text not null default 'unpaid',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orders_total_amount_check check (total_amount >= 0),
  constraint orders_status_check check (
    status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  constraint orders_payment_method_check check (
    payment_method in ('cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay')
  ),
  constraint orders_payment_status_check check (
    payment_status in ('unpaid', 'paid', 'refunded')
  )
);

-- =========================================================
-- 8. Bảng order_items
-- Lưu từng dòng sản phẩm trong đơn hàng
-- =========================================================

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,

  product_name text not null,
  product_price numeric(12, 2) not null,
  quantity integer not null,
  subtotal numeric(12, 2) not null,

  created_at timestamptz not null default now(),

  constraint order_items_product_price_check check (product_price >= 0),
  constraint order_items_quantity_check check (quantity > 0),
  constraint order_items_subtotal_check check (subtotal >= 0)
);

-- =========================================================
-- 9. Bảng reviews
-- Lưu đánh giá sản phẩm
-- =========================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  rating integer not null,
  comment text,
  is_approved boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reviews_rating_check check (rating >= 1 and rating <= 5),
  constraint reviews_one_user_one_product unique (product_id, user_id)
);

-- =========================================================
-- 10. Index để query nhanh hơn
-- =========================================================

create index categories_slug_idx on public.categories(slug);
create index categories_is_active_idx on public.categories(is_active);

create index products_category_id_idx on public.products(category_id);
create index products_slug_idx on public.products(slug);
create index products_is_active_idx on public.products(is_active);
create index products_is_featured_idx on public.products(is_featured);
create index products_created_at_idx on public.products(created_at desc);

create index product_images_product_id_idx on public.product_images(product_id);
create index product_images_sort_order_idx on public.product_images(sort_order);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);

create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

create index reviews_product_id_idx on public.reviews(product_id);
create index reviews_user_id_idx on public.reviews(user_id);
create index reviews_rating_idx on public.reviews(rating);

-- =========================================================
-- 11. Function tự cập nhật updated_at
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- 12. Trigger updated_at cho các bảng cần cập nhật
-- =========================================================

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create trigger set_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

-- =========================================================
-- 13. Bật Row Level Security
-- Tạm thời chỉ bật RLS, policy chi tiết sẽ làm ở cụm sau.
-- =========================================================

alter table public.categories enable row level security;
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;