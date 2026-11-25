"use client";

import { useState } from "react";
import Image from "next/image";

import { resolveProductImageUrl } from "@tkb/ui";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
};

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex];

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Image
          src={resolveProductImageUrl(
            selectedImage.image_url,
          )}
          alt={selectedImage.alt_text ?? productName}
          width={800}
          height={800}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`overflow-hidden rounded border ${
                index === selectedIndex
                  ? "ring-2 ring-primary"
                  : ""
              }`}
            >
              <Image
                src={resolveProductImageUrl(
                  image.image_url,
                )}
                alt={image.alt_text ?? productName}
                width={150}
                height={150}
                sizes="(min-width: 1024px) 12vw, 25vw"
                className="aspect-square object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}