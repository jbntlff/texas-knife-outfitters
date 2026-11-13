import { notFound } from "next/navigation";
import  Link  from "next/link";

import {
  getBrandById,
} from "@tkb/database";

import {
  updateBrand,
} from "../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BrandPage(
  { params }: PageProps,
) {
  const { id } =
    await params;

  const brand =
    await getBrandById(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Brand
        </h1>

        <p className="text-muted-foreground">
          Manage brand details.
        </p>
      <Link
        href="/brands"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to Brands
      </Link>
      </div>
      <div className="rounded-xl border p-6">
        <form
          key={JSON.stringify([
            brand.name,
            brand.slug,
            brand.description,
          ])}
          action={updateBrand}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="brandId"
            value={brand.id}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              name="name"
              defaultValue={brand.name}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Slug
            </label>

            <input
              name="slug"
              defaultValue={brand.slug}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              defaultValue={
                brand.description ?? ""
              }
              rows={5}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded border px-4 py-2"
          >
            Save Brand
          </button>
        </form>
      </div>
    </div>
  );
}