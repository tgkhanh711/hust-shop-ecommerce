"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  defaultValue?: string;
  className?: string;
};

export function SearchForm({ defaultValue = "", className }: SearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(defaultValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      router.push(routes.search);
      return;
    }

    router.push(`${routes.search}?q=${encodeURIComponent(trimmedKeyword)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <Search size={18} className="text-slate-500" />

        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm áo, quần, giày, balo..."
          className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Tìm kiếm
      </button>
    </form>
  );
}