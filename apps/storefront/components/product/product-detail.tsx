"use client";

import { Specifications } from "./specifications";
import { useMemo, useState } from "react";
import { VariantSelector } from "./variant-selector";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { formatPrice } from "@tkb/ui";

type VariantOption = {
  id: string;
  option_name: string;
  option_value: string;
};

type ProductVariant = {
  id: string;
  sku: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  active: boolean;
  variant_options: VariantOption[];
};

type ProductAttribute = {
  id: string;
  attribute_name: string;
  attribute_value: string;
  sort_order: number;
};

type ProductDetailProps = {
  product: {
    id: string;
    name: string;
    short_description?: string | null;
    description?: string | null;

    product_attributes: ProductAttribute[];

    product_variants: ProductVariant[];
  };
};

export function ProductDetail({
  product,
}: ProductDetailProps) {
  const firstVariant = product.product_variants[0];

  const [selectedOptions, setSelectedOptions] =
  useState<Record<string, string>>(
    Object.fromEntries(
      (firstVariant?.variant_options ?? []).map(
        (option) => [
          option.option_name,
          option.option_value,
        ],
      ),
    ),
  );

  const selectedVariant = useMemo(() => {
    if (!firstVariant) {
      return undefined;
    }

    return (
      product.product_variants.find(
        (variant) =>
          (variant.variant_options ?? []).every(
            (option) =>
              selectedOptions[
              option.option_name
              ] === option.option_value
          )
      ) ?? firstVariant
    );
  }, [
    product.product_variants,
    selectedOptions,
    firstVariant,
  ]);

  return (
    <>
      {product.short_description && (
        <p className="mt-4 text-lg text-muted-foreground">
          {product.short_description}
        </p>
      )}

      {firstVariant && selectedVariant && (
        <>
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                  {formatPrice( selectedVariant.price)}
              </span>

              {selectedVariant.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice( selectedVariant.compare_at_price)}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {selectedVariant.title}
            </p>

            <p className="text-sm text-muted-foreground">
              SKU: {selectedVariant.sku}
            </p>
          </div>

          <div className="mt-6">
            <VariantSelector
              variants={product.product_variants}
              selectedOptions={selectedOptions}
              onOptionChange={(
                optionName,
                optionValue
              ) =>
                setSelectedOptions((prev) => {
                  const candidates =
                    product.product_variants.filter(
                      (variant) =>
                        variant.variant_options.some(
                          (option) =>
                            option.option_name ===
                              optionName &&
                            option.option_value ===
                              optionValue
                        )
                    );

                  // Prefer a variant that keeps every other
                  // axis the buyer already picked; only when
                  // that's impossible (a diagonal variant
                  // matrix) do we fall back to the first
                  // variant with this value and adopt its
                  // other option values too, so every click
                  // lands on a real, valid variant.
                  const match =
                    candidates.find((variant) =>
                      variant.variant_options.every(
                        (option) =>
                          option.option_name ===
                            optionName ||
                          prev[
                            option.option_name
                          ] === option.option_value
                      )
                    ) ?? candidates[0];

                  if (!match) {
                    return prev;
                  }

                  return Object.fromEntries(
                    match.variant_options.map(
                      (option) => [
                        option.option_name,
                        option.option_value,
                      ]
                    )
                  );
                })
              }
            />
          </div>

          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              variantId={selectedVariant.id}
              productName={product.name}
              variantTitle={selectedVariant.title}
              sku={selectedVariant.sku}
              price={selectedVariant.price}
              attributes={product.product_attributes}
              selectedOptions={Object.entries(
                selectedOptions,
              ).map(([optionName, optionValue]) => ({
                optionName,
                optionValue,
              }))}
            />
          </div>
        </>
      )}

      {product.description && (
        <div className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">
            Description
          </h2>

          <p className="whitespace-pre-wrap text-muted-foreground">
            {product.description}
          </p>
        </div>
      )}
      <Specifications
        attributes={product.product_attributes ?? []}
      />
    </>
  );
}