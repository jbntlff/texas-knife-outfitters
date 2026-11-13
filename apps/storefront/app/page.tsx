import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { appConfig } from "@tkb/config";
import { resolveProductImageUrl } from "@tkb/ui";
import { getProducts } from "@tkb/database";

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

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      <section className="mb-16 rounded-2xl border bg-muted/30 px-8 py-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight">
            Premium Knives for Every Adventure
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Discover everyday carry, hunting, outdoor, and collector knives
            from the brand Texans trust the most,{" "}
            &ldquo;{appConfig.brandName}&rdquo;.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="#products"
              className="rounded-md bg-foreground px-6 py-3 text-background transition hover:opacity-90"
            >
              Shop Knives
            </a>

            <Link
              href="/"
              className="rounded-md border px-6 py-3 transition hover:bg-muted"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-bold">
          Featured Products
        </h2>

        <p className="mt-2 text-muted-foreground">
          Hand-selected knives trusted by enthusiasts, outdoorsmen, and everyday carriers.
        </p>
      </section>

      <div id="products" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classCards.map((item) => (
          <div
            key={item.key}
            className="group overflow-hidden rounded-lg border bg-muted shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              {item.imageUrl ? (
                <Link href={`/products?series=${item.key}`}>
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </Link>
              ) : (
                <div className="flex h-full items-center justify-center">
                  No Image
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>

              <Link
                href={`/products?series=${item.key}`}
                className="mt-6 inline-block rounded-md border px-4 py-2 text-sm font-semibold transition hover:bg-background"
              >
                View Gallery
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main >
  );
}