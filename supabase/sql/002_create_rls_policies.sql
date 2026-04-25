-- =========================================================
-- HUST Shop E-commerce RLS Policies
-- Next.js + Supabase
-- File: 002_create_rls_policies.sql
-- =========================================================

-- =========================================================
-- 1. Đảm bảo RLS đang bật cho 7 bảng
-- =========================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- =========================================================
-- 2. Cấp quyền database-level cho anon/authenticated
-- RLS vẫn là lớp quyết định cuối cùng.
-- =========================================================

grant usage on schema public to anon, authenticated;

grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.reviews to anon, authenticated;

grant all on public.categories to authenticated;
grant all on public.products to authenticated;
grant all on public.product_images to authenticated;
grant all on public.users to authenticated;
grant all on public.orders to authenticated;
grant all on public.order_items to authenticated;
grant all on public.reviews to authenticated;

-- =========================================================
-- 3. Xóa policies cũ nếu chạy lại file này
-- =========================================================

drop policy if exists "Anyone can view active categories" on public.categories;
drop policy if exists "Admins can manage categories" on public.categories;

drop policy if exists "Anyone can view active products" on public.products;
drop policy if exists "Admins can manage products" on public.products;

drop policy if exists "Anyone can view images of active products" on public.product_images;
drop policy if exists "Admins can manage product images" on public.product_images;

drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can insert own customer profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Admins can manage users" on public.users;

drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can create own orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;

drop policy if exists "Users can view own order items" on public.order_items;
drop policy if exists "Users can create own order items" on public.order_items;
drop policy if exists "Admins can manage order items" on public.order_items;

drop policy if exists "Anyone can view approved reviews" on public.reviews;
drop policy if exists "Users can create own reviews" on public.reviews;
drop policy if exists "Users can update own reviews" on public.reviews;
drop policy if exists "Users can delete own reviews" on public.reviews;
drop policy if exists "Admins can manage reviews" on public.reviews;

-- =========================================================
-- 4. Function kiểm tra admin
-- Admin được xác định bằng public.users.role = 'admin'
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- =========================================================
-- 5. Trigger chặn user tự đổi role thành admin qua client
-- Nếu auth.uid() is null thì cho phép để SQL Editor/admin setup thủ công.
-- =========================================================

create or replace function public.prevent_user_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role
     and auth.uid() is not null
     and not public.is_admin()
  then
    raise exception 'You are not allowed to change user role.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_users_role_change on public.users;

create trigger prevent_users_role_change
before update of role on public.users
for each row
execute function public.prevent_user_role_change();

-- =========================================================
-- 6. Policies cho categories
-- =========================================================

create policy "Anyone can view active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- 7. Policies cho products
-- =========================================================

create policy "Anyone can view active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- 8. Policies cho product_images
-- Chỉ public ảnh nếu sản phẩm tương ứng đang active.
-- =========================================================

create policy "Anyone can view images of active products"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.is_active = true
  )
);

create policy "Admins can manage product images"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- 9. Policies cho users
-- User chỉ xem/sửa profile của chính họ.
-- Admin xem/sửa được toàn bộ users.
-- =========================================================

create policy "Users can view own profile"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "Users can insert own customer profile"
on public.users
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'customer'
);

create policy "Users can update own profile"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can manage users"
on public.users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- 10. Policies cho orders
-- User chỉ xem/tạo đơn hàng của chính họ.
-- Admin quản lý toàn bộ đơn hàng.
-- =========================================================

create policy "Users can view own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create own orders"
on public.orders
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- 11. Policies cho order_items
-- User chỉ xem/tạo item thuộc đơn hàng của chính họ.
-- Admin quản lý toàn bộ order_items.
-- =========================================================

create policy "Users can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can create own order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Admins can manage order items"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- 12. Policies cho reviews
-- Public xem review đã duyệt.
-- User đăng nhập tạo/sửa/xóa review của chính họ.
-- Admin quản lý toàn bộ review.
-- =========================================================

create policy "Anyone can view approved reviews"
on public.reviews
for select
to anon, authenticated
using (is_approved = true);

create policy "Users can create own reviews"
on public.reviews
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own reviews"
on public.reviews
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own reviews"
on public.reviews
for delete
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage reviews"
on public.reviews
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());