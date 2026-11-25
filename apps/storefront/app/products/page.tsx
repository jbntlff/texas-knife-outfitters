import Link from "next/link";
import Image from "next/image";

import { getProducts } from "@tkb/database";
import { resolveProductImageUrl } from "@tkb/ui";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { seriesLabels } from "@/lib/series";

type Props = {
  searchParams: Promise<{
    series?: string;
  }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { series } = await searchParams;

  const allProducts = await getProducts();
  const products = series
    ? allProducts?.filter((product) => product.series === series)
    : allProducts;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          {
            label: series
              ? seriesLabels[series] ?? "Products"
              : "Products",
          },
        ]}
      />

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          {series ? seriesLabels[series] ?? "Texas Knife Outfitters" : "Texas Knife Outfitters"}
        </h1>

        <p className="mt-3 text-muted-foreground">
          Premium knives for everyday carry, hunting, and collection.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => {
          const image = product.product_images?.[0];
          const variant = product.product_variants?.[0];

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-lg border bg-muted shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {image ? (
                  <Image
                    src={resolveProductImageUrl(
                      image.image_url,
                    )}
                    alt={image.alt_text ?? product.name}
                    width={600}
                    height={600}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    No Image
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="font-semibold">
                  {product.name}
                </h2>

                <div className="mt-3 flex gap-2">
                  {product.brands && (
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {product.brands.name}
                    </span>
                  )}

                  {product.categories && (
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {product.categories.name}
                    </span>
                  )}
                </div>

                {variant && (
                  <div className="mt-4">
                    <p className="text-lg font-bold">
                      ${Number(variant.price).toFixed(2)}
                    </p>

                    {variant.compare_at_price && (
                      <p className="text-sm text-muted-foreground line-through">
                        ${Number(variant.compare_at_price).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}