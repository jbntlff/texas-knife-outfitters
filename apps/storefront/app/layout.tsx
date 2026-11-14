import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from '@/components/cart/cart-provider'
import { CartLink } from "@/components/cart/cart-link"
import { AccountLink } from "@/components/auth/account-link";

import { env } from "@tkb/config";
import { createServerSupabaseClient } from "@tkb/auth/server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Texas Knife Outfitters",
  description:
    "Premium knives for everyday carry, hunting, and collection.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <CartProvider userId={user?.id ?? null}>
          <header>
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex items-center justify-between border-b py-4">
                <a
                  href={env.brochureUrl}
                  className="flex items-center gap-3"
                >
                  <Image
                    src="/images/tko-logo-horizontal-favicon-icon.webp"
                    alt="Texas Knife Outfitters"
                    width={2000}
                    height={679}
                    className="h-10 w-auto shrink-0 object-contain dark:invert dark:brightness-0"
                    priority
                  />
                </a>

                <div className="flex items-center gap-6">
                  <form
                    action="/search"
                    className="hidden md:flex items-center gap-2"
                  >
                    <input
                      type="search"
                      name="q"
                      placeholder="Search knives..."
                      className="w-64 rounded-md border px-3 py-2 text-sm"
                    />

                    <button
                      type="submit"
                      className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                    >
                      Search
                    </button>
                  </form>

                  <nav className="flex items-center gap-6">
                    <a
                      href={env.brochureUrl}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Home
                    </a>
                    <AccountLink />
                    <CartLink />
                  </nav>

                </div>
              </div>
            </div>
          </header>

          <div className="flex-1">
            {children}
          </div>

          <footer className="mt-16">
            <div className="mx-auto max-w-7xl px-6">
              <div className="border-t py-8 text-sm text-muted-foreground">
                © 2026 Texas Knife Outfitters
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}