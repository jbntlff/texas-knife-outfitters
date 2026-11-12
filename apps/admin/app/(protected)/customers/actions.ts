"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@tkb/auth/server";

import { createAdminClient } from "@tkb/database";

export async function inviteCustomer(
  formData: FormData,
) {
  await requireAdmin();

  const firstName =
    (formData.get("firstName") as string)?.trim();

  const lastName =
    (formData.get("lastName") as string)?.trim();

  const email =
    (formData.get("email") as string)
      ?.trim()
      .toLowerCase();

  if (!firstName || !lastName || !email) {
    redirect(
      `/customers?error=${encodeURIComponent("First name, last name, and email are required.")}`,
    );
  }

  const supabase = createAdminClient();

  // A plain .insert() below would crash with an unhandled Postgres
  // unique-violation if this email is already a customer — check
  // first so re-submitting (e.g. the same invite twice) shows a
  // readable message instead of Next's generic error page.
  const { data: existingProfile } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

  if (existingProfile) {
    redirect(
      `/customers?error=${encodeURIComponent("A customer with this email already exists.")}`,
    );
  }

  const storefrontUrl =
    process.env.NEXT_PUBLIC_STOREFRONT_URL;

  const { data, error } =
    await supabase.auth.admin.inviteUserByEmail(
      email,
      storefrontUrl
        ? {
            // Route through /auth/confirm, same as password resets:
            // it exchanges the invite code for a session server-side
            // and lands on /reset-password so the customer can set
            // their password. Landing straight on "/" leaves the
            // code unexchanged — no session, no password prompt.
            redirectTo: `${storefrontUrl}/auth/confirm`,
          }
        : undefined,
    );

  if (error) {
    redirect(
      `/customers?error=${encodeURIComponent(error.message)}`,
    );
  }

  const user = data.user;

  if (!user) {
    redirect(
      `/customers?error=${encodeURIComponent("Invite did not return a user.")}`,
    );
  }

  const { error: profileError } =
    await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email,
        role: "customer",
        first_name: firstName,
        last_name: lastName,
        marketing_opt_in: false,
      });

  if (profileError) {
    redirect(
      `/customers?error=${encodeURIComponent(profileError.message)}`,
    );
  }

  revalidatePath("/customers");

  redirect(`/customers/${user.id}`);
}

export async function updateCustomer(
  formData: FormData,
) {
  await requireAdmin();

  const customerId =
    formData.get("customerId") as string;

  const firstName =
    formData.get("firstName") as string;

  const lastName =
    formData.get("lastName") as string;

  const role =
    formData.get("role") as string;

  const marketingOptIn =
    formData.get("marketingOptIn") === "on";

  const email =
    (formData.get("email") as string)
      ?.trim()
      .toLowerCase();

  const supabase = createAdminClient();

  if (email) {
    // Updates the real login email directly, bypassing the normal
    // double confirmation flow — for when a customer has lost access
    // to their old inbox and can't confirm from it themselves.
    const { error: authError } =
      await supabase.auth.admin.updateUserById(
        customerId,
        {
          email,
          email_confirm: true,
        },
      );

    if (authError) {
      if (
        authError.message
          .toLowerCase()
          .includes("already")
      ) {
        throw new Error(
          "An account with this email already exists.",
        );
      }

      throw authError;
    }
  }

  const { error } =
    await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        role,
        marketing_opt_in: marketingOptIn,
        ...(email && { email }),
      })
      .eq("id", customerId);

  if (error) {
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function sendPasswordReset(
  formData: FormData,
) {
  await requireAdmin();

  const email =
    formData.get("email") as string;

  const supabase = createAdminClient();

  const storefrontUrl =
    process.env.NEXT_PUBLIC_STOREFRONT_URL;

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      storefrontUrl
        ? {
            // Route through /auth/confirm rather than straight to
            // /reset-password: that route exchanges the code
            // server-side (no locally-stored PKCE verifier needed),
            // which works no matter who triggered the reset or which
            // device opens the link. Landing directly on
            // /reset-password relies on the *browser's own* exchange,
            // which only succeeds in the exact browser that requested
            // the reset — never true for one an admin sends.
            redirectTo: `${storefrontUrl}/auth/confirm`,
          }
        : undefined,
    );

  if (error) {
    throw error;
  }
}

export async function deleteCustomer(
  formData: FormData,
) {
  await requireAdmin();

  const customerId =
    formData.get("customerId") as string;

  const supabase = createAdminClient();

  const { error } =
    await supabase.auth.admin.deleteUser(
      customerId,
    );

  if (error) {
    throw error;
  }

  revalidatePath("/customers");

  redirect("/customers");
}
