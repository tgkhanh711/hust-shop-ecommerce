"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateProfile,
  type UpdateProfileState,
} from "@/app/account/actions";

type ProfileFormProps = {
  initialFullName: string;
  initialPhone: string;
  initialAddress: string;
};

const initialState: UpdateProfileState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Đang lưu..." : "Lưu thông tin"}
    </button>
  );
}

export function ProfileForm({
  initialFullName,
  initialPhone,
  initialAddress,
}: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-semibold text-slate-900"
        >
          Họ và tên
        </label>

        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={initialFullName}
          placeholder="Ví dụ: Tô Gia Khánh"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-slate-900"
        >
          Số điện thoại
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialPhone}
          placeholder="Ví dụ: 0366674487"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-semibold text-slate-900"
        >
          Địa chỉ mặc định
        </label>

        <textarea
          id="address"
          name="address"
          rows={4}
          defaultValue={initialAddress}
          placeholder="Ví dụ: Hai Bà Trưng, Hà Nội"
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
        />
      </div>

      {state.message ? (
        <div
          className={
            state.success
              ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              : "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}