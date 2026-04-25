"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin-orders";

const orderStatuses = [
  {
    value: "pending",
    label: "Chờ xử lý",
  },
  {
    value: "processing",
    label: "Đang xử lý",
  },
  {
    value: "completed",
    label: "Hoàn thành",
  },
  {
    value: "cancelled",
    label: "Đã hủy",
  },
] as const;

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: string;
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: string) {
    const previousStatus = status;

    setStatus(nextStatus);
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);

      setMessage(result.message);
      setIsError(!result.success);

      if (!result.success) {
        setStatus(previousStatus);
      }
    });
  }

  return (
    <div className="space-y-2">
      <select
        value={status}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 rounded-full border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition hover:bg-slate-50 focus:border-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {orderStatuses.map((orderStatus) => (
          <option key={orderStatus.value} value={orderStatus.value}>
            {orderStatus.label}
          </option>
        ))}
      </select>

      {isPending ? (
        <p className="text-xs text-slate-500">Đang cập nhật...</p>
      ) : null}

      {message ? (
        <p
          className={
            isError ? "text-xs text-red-600" : "text-xs text-green-600"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}