"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/how-to-order", label: "How to Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type SiteHeaderProps = {
  brandName: string;
  storefrontUrl: string;
};

export function SiteHeader({ brandName, storefrontUrl }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  const closeMenu = () => setOpen(false);

  return (
    <header>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between border-b py-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center"
          >
            <Image
              src="/images/tko-logo-horizontal-favicon-icon.webp"
              alt={brandName}
              width={2000}
              height={679}
              className="h-10 w-auto shrink-0 object-contain dark:invert dark:brightness-0"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            <a
              href={`${storefrontUrl}/search`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Search
            </a>

            <a
              href={storefrontUrl}
              className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
            >
              Shop
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-foreground/25 bg-background text-foreground md:hidden"
          >
            {open ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-1 border-t px-6 py-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <a
            href={`${storefrontUrl}/search`}
            className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Search
          </a>

          <a
            href={storefrontUrl}
            className="mt-2 rounded-md bg-foreground px-4 py-3 text-center text-sm text-background transition hover:opacity-90"
          >
            Shop
          </a>
        </nav>
      ) : null}
    </header>
  );
}
