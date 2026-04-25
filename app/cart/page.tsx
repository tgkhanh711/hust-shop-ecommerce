import { CartContent } from "@/components/cart/cart-content";
import { Container } from "@/components/layout/container";

export const metadata = {
  title: "Giỏ hàng | HUST Shop",
  description: "Xem và chỉnh sửa sản phẩm trong giỏ hàng của bạn.",
};

export default function CartPage() {
  return (
    <section className="bg-white">
      <Container className="py-12 sm:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Cart
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Giỏ hàng
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Kiểm tra sản phẩm, điều chỉnh số lượng hoặc xóa sản phẩm trước khi
            tiến hành thanh toán.
          </p>
        </div>

        <CartContent />
      </Container>
    </section>
  );
}