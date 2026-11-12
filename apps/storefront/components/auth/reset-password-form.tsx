"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@tkb/auth";

type Status =
  | "need-code"
  | "ready"
  | "saving"
  | "done";

export function ResetPasswordForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<Status>("need-code");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // The reset email leads with a one-time code and links to this
    // page plain, with no token attached — a link with the actual
    // token always invalidates the code the moment it's opened (they
    // share one underlying token), and can't complete a session
    // exchange for a reset someone else (an admin) triggered anyway.
    // So the code is the only path this page expects by default.
    //
    // The checks below exist only for the rare edge case where a
    // genuine recovery session is somehow already sitting in cookies
    // on page load (e.g. a customized flow elsewhere still issuing a
    // real magic link). They're deliberately non-blocking — nothing
    // here should make the visitor wait before they can start typing
    // their code.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    // getSession() alone isn't enough to trust here — a visitor can
    // easily already have an unrelated, perfectly valid *regular
    // login* session sitting in this browser, and that would let
    // them silently set a new password for whichever account they
    // happened to already be logged in as. The distinguishing signal
    // is the session's amr (authentication method reference) claim:
    // a recovery-established session always carries an "otp" method
    // entry; a regular password login never does.
    supabase.auth.getSession().then(({ data }) => {
      const payload = data.session?.access_token
        ?.split(".")[1];

      const claims = payload
        ? JSON.parse(atob(payload))
        : null;

      const isRecoverySession =
        Array.isArray(claims?.amr) &&
        claims.amr.some(
          (entry: { method?: string }) =>
            entry?.method === "otp" ||
            entry?.method === "recovery",
        );

      if (data.session && isRecoverySession) {
        setStatus("ready");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleVerifyCode(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail || !trimmedCode) {
      setError(
        "Email and code are required.",
      );
      return;
    }

    setVerifying(true);

    // This page is also where an admin-triggered invite lands (see
    // inviteCustomer in apps/admin), whose email offers the same
    // "enter the code" fallback — but an invite code is a different
    // OTP type than a password-reset code, and GoTrue rejects a code
    // verified under the wrong type. Try both rather than requiring
    // the caller to know which flow they're in.
    let verifyError: { message: string } | null = null;

    for (const type of ["recovery", "invite"] as const) {
      const { error } =
        await supabase.auth.verifyOtp({
          email: trimmedEmail,
          token: trimmedCode,
          type,
        });

      verifyError = error;

      if (!error) {
        break;
      }
    }

    setVerifying(false);

    if (verifyError) {
      setError(
        "That code is invalid or has expired.",
      );
      return;
    }

    setStatus("ready");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");

    const { error: updateError } =
      await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Unable to update your password.");
      setStatus("ready");
      return;
    }

    setStatus("done");
    router.push("/account");
    router.refresh();
  }

  if (status === "need-code") {
    return (
      <form
        onSubmit={handleVerifyCode}
        className="space-y-5"
      >
        <p className="text-sm text-muted-foreground">
          Enter the email and one-time code from the
          password reset email.
        </p>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="reset-email"
            className="text-sm font-medium"
          >
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reset-code"
            className="text-sm font-medium"
          >
            One-time code
          </label>
          <input
            id="reset-code"
            inputMode="numeric"
            required
            value={code}
            onChange={(event) =>
              setCode(event.target.value)
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={verifying}
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {verifying
            ? "Verifying..."
            : "Verify code"}
        </button>

        <a
          href="/forgot-password"
          className="block text-center text-sm font-medium text-foreground hover:underline"
        >
          Request a new code
        </a>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {status === "saving"
          ? "Updating..."
          : "Update password"}
      </button>
    </form>
  );
}
