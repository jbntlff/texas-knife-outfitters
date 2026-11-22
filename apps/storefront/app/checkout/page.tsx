import Link from "next/link";

import { createServerSupabaseClient } from "@tkb/auth/server";

import { CheckoutForm } from "@/components/checkout/checkout-form";

export default async function CheckoutPage() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialEmail = "";
  let customerName = "";

  if (user) {
    const { data: profile } =
      await supabase
        .from("profiles")
        .select(
          "email, role, first_name, last_name",
        )
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role === "customer") {
      initialEmail = profile.email ?? "";

      customerName = [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold">
        Checkout
      </h1>

      {initialEmail && (
        <div className="mb-8 rounded-2xl border bg-muted p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Signed In
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {customerName
              ? `Checking out as ${customerName}`
              : "Checking out with your customer account"}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {initialEmail}
          </p>

          <div className="mt-4">
            <Link
              href="/account"
              className="text-sm font-medium underline underline-offset-4"
            >
              View my account
            </Link>
          </div>
        </div>
      )}

      <CheckoutForm
        initialEmail={initialEmail}
        initialName={customerName}
      />
    </main>
  );
}