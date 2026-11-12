"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createClient } from "@tkb/auth";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError("");

    const supabase =
      createClient();

    const { error } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        });

    if (error) {
      setError(error.message);
      return;
    }

    router.push(
      "/dashboard",
    );

    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
      <h2 className="mb-6 text-center text-2xl font-semibold">
        Sign In
      </h2>

      <form
        onSubmit={handleLogin}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value,
              )
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md border px-4 py-2 font-medium"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:underline"
        >
          Forgot password?
        </Link>
      </p>
    </div>
  );
}