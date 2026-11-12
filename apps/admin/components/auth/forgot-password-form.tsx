"use client";

import { useActionState } from "react";

import {
  requestPasswordResetAction,
  type RequestPasswordResetState,
} from "@/app/forgot-password/actions";

const initialState: RequestPasswordResetState = {
  error: null,
  submitted: false,
};

export function ForgotPasswordForm() {
  const [state, formAction, pending] =
    useActionState(
      requestPasswordResetAction,
      initialState,
    );

  if (state.submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        If an admin account exists for that email, we&apos;ve sent a link to reset the password.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4"
    >
      {state.error && (
        <p className="text-sm text-red-500">
          {state.error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Email
        </label>

        <input
          name="email"
          type="email"
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending
          ? "Sending..."
          : "Send reset link"}
      </button>
    </form>
  );
}
