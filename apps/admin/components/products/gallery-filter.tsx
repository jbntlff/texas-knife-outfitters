"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * "Include gallery pieces" toggle for the admin products list. Stored in the
 * URL (?gallery=hide) so the choice survives reloads and archive/restore
 * actions, and can be bookmarked.
 */
export function GalleryFilter({
  includeGallery,
}: {
  includeGallery: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(checked: boolean) {
    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.delete("gallery");
    } else {
      params.set("gallery", "hide");
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={includeGallery}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
      Include gallery pieces
    </label>
  );
}
