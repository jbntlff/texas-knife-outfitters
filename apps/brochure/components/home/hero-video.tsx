import Image from "next/image";
import Link from "next/link";

import { appConfig, env } from "@tkb/config";

export function HeroVideo() {
  return (
    <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/tkb-hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/videos/tkb-hero.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 bg-black/25"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent"
        aria-hidden="true"
      />

      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent sm:h-40"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[calc(100svh-4rem)] items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <Image
              src="/images/tko-logo-horizontal-favicon-icon.webp"
              alt={appConfig.brandName}
              width={2000}
              height={679}
              className="mb-5 h-[70px] w-auto brightness-0 invert sm:h-[84px] lg:h-[105px]"
              priority
            />

            <h1 className="max-w-xl text-4xl font-semibold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Built with purpose. Crafted with character.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85 sm:text-xl">
              At {appConfig.brandName}, we believe a great knife is more than
              a tool—it&rsquo;s a reflection of craftsmanship, character, and
              the people who carry it. Discover handcrafted, MidTech, and
              Signature Series knives built for the outdoors, everyday use,
              and those who appreciate a knife made right.
            </p>

            <p className="mt-4 max-w-xl text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Quality craftsmanship. Texas spirit. Knives built to last.
            </p>

            <div className="mt-9">
              <Link
                href={env.storefrontUrl}
                className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
              >
                Shop Knives
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
