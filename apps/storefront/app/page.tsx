import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { resolveProductImageUrl } from "@tkb/ui";
import { getProducts } from "@tkb/database";

import { ProductCard } from "@/components/product-card";

const classes = [
  {
    key: "legacy",
    title: "Legacy Series",
    description: "Handcrafted knives rooted in tradition",
  },
  {
    key: "performance",
    title: "Performance Series",
    description: "Precision-crafted knives built to perform",
  },
  {
    key: "signature_series",
    title: "Signature Series",
    description: "Our most distinctive and exclusive work",
  },
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  // Local Supabase auth doesn't honor the redirectTo passed to
  // resetPasswordForEmail and always lands recovery links here with a
  // PKCE `code` param. Hand it to the route handler that can exchange it
  // for a session (needs to set cookies, which a page component can't do).
  const { code } = await searchParams;

  if (code) {
    redirect(`/auth/confirm?code=${code}`);
  }

  const products = await getProducts();

  const classCards = classes.map((item) => {
    const classProducts = products?.filter(
      (product) => product.series === item.key,
    );

    const featured =
      classProducts?.find((product) => product.featured) ??
      classProducts?.[0];

    const image = featured?.product_images?.[0];

    return {
      ...item,
      imageUrl: image
        ? resolveProductImageUrl(image.image_url)
        : null,
      imageAlt: image?.alt_text ?? featured?.name ?? item.title,
    };
  });

  // Featured knives first, then the rest alphabetically (getProducts
  // already sorts by name).
  const shopProducts = [
    ...(products ?? []).filter((product) => product.featured),
    ...(products ?? []).filter((product) => !product.featured),
  ].slice(0, 8);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Shop Knives
          </h1>

          <p className="mt-2 text-muted-foreground">
            Choose a series, or browse every knife we carry.
          </p>
        </div>

        <Link
          href="/products"
          className="rounded-md bg-foreground px-6 py-3 font-semibold text-background transition hover:opacity-90"
        >
          Shop all knives →
        </Link>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classCards.map((item) => (
          <Link
            key={item.key}
            href={`/products?series=${item.key}`}
            className="group overflow-hidden rounded-lg border bg-muted shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {item.title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="text-xl transition group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {shopProducts.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Knives
            </h2>

            <Link
              href="/products"
              className="text-sm font-medium underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shopProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
