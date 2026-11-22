"use client";

import {
  useTransition,
} from "react";

import {
  updateOrderStatusAction,
} from "../actions";

type Props = {
  orderId: string;
  currentStatus: string;
};

export function StatusForm({
  orderId,
  currentStatus,
}: Props) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(formData) =>
        start(async () => {
          await updateOrderStatusAction(
            formData,
          );
        })
      }
    >
      <input
        type="hidden"
        name="orderId"
        value={orderId}
      />
      <select
        key={currentStatus}
        name="status"
        defaultValue={currentStatus}
        className="rounded border px-3 py-2"
      >
        <option value="awaiting_payment"> Awaiting Payment </option>
        <option value="pending"> Pending </option>
        <option value="paid"> Paid </option>
        <option value="shipped"> Shipped </option>
        <option value="delivered"> Delivered </option>
        <option value="cancelled"> Cancelled </option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="ml-3 rounded border px-4 py-2"
      >
        {pending
          ? "Saving..."
          : "Save"}
      </button>
    </form>
  );
}