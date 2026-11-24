import Link from "next/link";

import { resolveProductImageUrl } from "@tkb/ui";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    product_images?: { image_url: string }[] | null;
    product_variants?: { price: number | string }[] | null;
    show_in_gallery?: boolean | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.product_images?.[0];
  const variant = product.product_variants?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded-lg border bg-muted p-4 transition hover:bg-background"
    >
      {image && (
        <img
          src={resolveProductImageUrl(
            image.image_url,
          )}
          alt={product.name}
          className="mb-4 aspect-square w-full rounded object-cover"
        />
      )}

      <h2 className="font-semibold">
        {product.name}
      </h2>

      {product.show_in_gallery ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Gallery piece · not for sale
        </p>
      ) : (
        variant && (
          <p className="mt-2 text-sm text-muted-foreground">
            ${variant.price}
          </p>
        )
      )}
    </Link>
  );
}