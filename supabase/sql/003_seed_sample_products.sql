-- =========================================================
-- HUST Shop E-commerce Seed Data
-- File: 003_seed_sample_products.sql
-- Thêm dữ liệu mẫu cho categories, products, product_images
-- =========================================================

-- =========================================================
-- 1. Xóa dữ liệu mẫu cũ nếu chạy lại file này
-- Chỉ xóa đúng các sản phẩm/danh mục mẫu theo slug bên dưới.
-- =========================================================

delete from public.product_images
where product_id in (
  select id
  from public.products
  where slug in (
    'ao-thun-basic-den',
    'ao-thun-basic-trang',
    'ao-polo-nam-xanh-navy',
    'quan-jeans-nam-slim-fit',
    'quan-short-kaki-be',
    'giay-sneaker-trang-basic',
    'balo-laptop-den',
    'mu-luoi-trai-basic'
  )
);

delete from public.products
where slug in (
  'ao-thun-basic-den',
  'ao-thun-basic-trang',
  'ao-polo-nam-xanh-navy',
  'quan-jeans-nam-slim-fit',
  'quan-short-kaki-be',
  'giay-sneaker-trang-basic',
  'balo-laptop-den',
  'mu-luoi-trai-basic'
);

delete from public.categories
where slug in (
  'ao-nam',
  'quan-nam',
  'giay-dep',
  'phu-kien'
);

-- =========================================================
-- 2. Thêm danh mục mẫu
-- =========================================================

insert into public.categories (
  id,
  name,
  slug,
  description,
  image_url,
  is_active
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Áo nam',
    'ao-nam',
    'Các mẫu áo nam cơ bản, dễ phối đồ, phù hợp đi học và đi làm.',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Quần nam',
    'quan-nam',
    'Quần jeans, quần kaki, quần short dành cho nam.',
    'https://images.unsplash.com/photo-1542272604-787c3835535d',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Giày dép',
    'giay-dep',
    'Giày sneaker và các mẫu giày đi hằng ngày.',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Phụ kiện',
    'phu-kien',
    'Balo, mũ, túi và phụ kiện thời trang cơ bản.',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    true
  );

-- =========================================================
-- 3. Thêm sản phẩm mẫu
-- =========================================================

insert into public.products (
  id,
  category_id,
  name,
  slug,
  description,
  price,
  sale_price,
  stock,
  sku,
  thumbnail_url,
  is_active,
  is_featured
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'Áo thun Basic Đen',
    'ao-thun-basic-den',
    'Áo thun nam màu đen, form regular fit, chất liệu cotton thoáng mát, dễ phối với quần jeans hoặc quần short.',
    199000,
    159000,
    50,
    'TSHIRT-BLACK-001',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    true,
    true
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    'Áo thun Basic Trắng',
    'ao-thun-basic-trang',
    'Áo thun nam màu trắng tối giản, phù hợp mặc hằng ngày, chất vải mềm và dễ giặt.',
    199000,
    null,
    40,
    'TSHIRT-WHITE-001',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820',
    true,
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '11111111-1111-1111-1111-111111111111',
    'Áo Polo Nam Xanh Navy',
    'ao-polo-nam-xanh-navy',
    'Áo polo nam màu xanh navy, cổ bẻ lịch sự, phù hợp đi học, đi làm hoặc đi chơi.',
    299000,
    249000,
    35,
    'POLO-NAVY-001',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4',
    true,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '22222222-2222-2222-2222-222222222222',
    'Quần Jeans Nam Slim Fit',
    'quan-jeans-nam-slim-fit',
    'Quần jeans nam dáng slim fit, màu xanh đậm, dễ phối với áo thun, áo polo hoặc sơ mi.',
    499000,
    429000,
    30,
    'JEANS-SLIM-001',
    'https://images.unsplash.com/photo-1542272604-787c3835535d',
    true,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    'Quần Short Kaki Be',
    'quan-short-kaki-be',
    'Quần short kaki màu be, nhẹ, thoải mái, phù hợp mặc mùa hè hoặc đi chơi cuối tuần.',
    269000,
    null,
    45,
    'SHORT-KAKI-001',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b',
    true,
    false
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '33333333-3333-3333-3333-333333333333',
    'Giày Sneaker Trắng Basic',
    'giay-sneaker-trang-basic',
    'Giày sneaker trắng kiểu dáng tối giản, dễ phối đồ, phù hợp đi học, đi làm và đi chơi.',
    699000,
    599000,
    25,
    'SNEAKER-WHITE-001',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    true,
    true
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '44444444-4444-4444-4444-444444444444',
    'Balo Laptop Đen',
    'balo-laptop-den',
    'Balo laptop màu đen, thiết kế tối giản, có ngăn chống sốc phù hợp laptop 14-15 inch.',
    399000,
    349000,
    20,
    'BACKPACK-BLACK-001',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    true,
    false
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    '44444444-4444-4444-4444-444444444444',
    'Mũ Lưỡi Trai Basic',
    'mu-luoi-trai-basic',
    'Mũ lưỡi trai basic, form đơn giản, phù hợp dùng hằng ngày.',
    149000,
    null,
    60,
    'CAP-BASIC-001',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
    true,
    false
  );

-- =========================================================
-- 4. Thêm ảnh sản phẩm mẫu
-- Mỗi sản phẩm hiện có 1 ảnh chính.
-- Sau này phần admin sẽ cho upload nhiều ảnh thật bằng Supabase Storage.
-- =========================================================

insert into public.product_images (
  id,
  product_id,
  image_url,
  alt_text,
  sort_order,
  is_primary
)
values
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    'Áo thun Basic Đen',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820',
    'Áo thun Basic Trắng',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4',
    'Áo Polo Nam Xanh Navy',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'https://images.unsplash.com/photo-1542272604-787c3835535d',
    'Quần Jeans Nam Slim Fit',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b',
    'Quần Short Kaki Be',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee6',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    'Giày Sneaker Trắng Basic',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7',
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    'Balo Laptop Đen',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee8',
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
    'Mũ Lưỡi Trai Basic',
    0,
    true
  );