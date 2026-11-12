"use server";

import { createServerActionSupabaseClient } from "@tkb/auth/server";
import { env } from "@tkb/config";

export type RequestPasswordResetState = {
  error: string | null;
  submitted: boolean;
};

export async function requestPasswordResetAction(
  _prevState: RequestPasswordResetState,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const email =
    formData.get("email")?.toString().trim() ?? "";

  if (!email) {
    return {
      error: "Email is required.",
      submitted: false,
    };
  }

  const supabase =
    await createServerActionSupabaseClient();

  // Routes through the storefront's /auth/confirm + /reset-password,
  // same as the admin-triggered reset on a customer's profile page —
  // there's no separate copy of that flow in this app, and the
  // underlying Supabase Auth account is shared across all three apps,
  // so setting the password there works fine for admin sign-in too.
  await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${env.storefrontUrl}/auth/confirm`,
    },
  );

  // Always report success, whether or not the email matches an
  // account, so this form can't be used to enumerate admins.
  return {
    error: null,
    submitted: true,
  };
}
