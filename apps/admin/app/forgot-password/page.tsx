import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
          <h2 className="mb-2 text-center text-2xl font-semibold">
            Reset password
          </h2>

          <p className="mb-6 text-center text-sm text-muted-foreground">
            Enter your admin email and we&apos;ll
            send you a link to reset it.
          </p>

          <ForgotPasswordForm />

          <p className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="font-medium hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
