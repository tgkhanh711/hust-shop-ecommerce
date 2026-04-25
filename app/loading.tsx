import { Container } from "@/components/layout/container";

export default function LoadingPage() {
  return (
    <section className="bg-white">
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

          <h1 className="mt-6 text-2xl font-bold text-slate-950">
            Đang tải dữ liệu
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Vui lòng chờ trong giây lát.
          </p>
        </div>
      </Container>
    </section>
  );
}