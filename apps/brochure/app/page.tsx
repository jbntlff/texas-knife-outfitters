import Link from "next/link";

import { appConfig } from "@tkb/config";
import { getActiveReviews } from "@tkb/database";

import { HeroVideo } from "@/components/home/hero-video";
import { TkoReviews } from "@/components/home/tko-reviews";

export default async function HomePage() {
  const reviews = await getActiveReviews();

  return (
    <>
      <HeroVideo />

      <main className="relative z-10 mx-auto -mt-16 max-w-7xl px-6 pb-12 sm:-mt-20">
        <section className="grid gap-6 sm:grid-cols-3">
          <Link
            href="/gallery"
            className="rounded-2xl border bg-muted p-8 shadow-xl transition hover:bg-background"
          >
            <h2 className="text-xl font-semibold">The Gallery</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore the craftsmanship behind {appConfig.brandName}. Take a
              closer look at our knives, unique materials, Damascus
              patterns, and the details that make each piece one of a kind.
            </p>
            <p className="mt-4 text-sm font-semibold text-foreground">
              Check Us Out →
            </p>
          </Link>

          <Link
            href="/about"
            className="rounded-2xl border bg-muted p-8 shadow-xl transition hover:bg-background"
          >
            <h2 className="text-xl font-semibold">
              About {appConfig.brandName}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {appConfig.brandName} was built on a simple appreciation for
              great knives and the craftsmanship behind them. From
              handcrafted blades to distinctive materials and finishes, we
              believe every knife should have purpose, character, and a
              story worth carrying.
            </p>
            <p className="mt-4 text-sm font-semibold text-foreground">
              Discover Our Story →
            </p>
          </Link>

          <Link
            href="/contact"
            className="rounded-2xl border bg-muted p-8 shadow-xl transition hover:bg-background"
          >
            <h2 className="text-xl font-semibold">Get in Touch</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Have a question about a knife, need help choosing the right
              one, or simply want to talk knives? We&rsquo;d love to hear
              from you. At {appConfig.brandName}, we believe great
              relationships are built on good conversation and a shared
              appreciation for quality craftsmanship.
            </p>
            <p className="mt-4 text-sm font-semibold text-foreground">
              Contact Us →
            </p>
          </Link>
        </section>
      </main>

      <TkoReviews reviews={reviews} />
    </>
  );
}
