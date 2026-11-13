import { notFound } from "next/navigation";
import  Link  from "next/link";

import {
  getCategoryById,
} from "@tkb/database";

import {
  updateCategory,
} from "../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryPage(
  { params }: PageProps,
) {
  const { id } =
    await params;

  const category =
    await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Category
        </h1>

        <p className="text-muted-foreground">
          Manage category details.
        </p>
      <Link
        href="/categories"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to Categories
      </Link>
      </div>
      <div className="rounded-xl border p-6">
        <form
          key={JSON.stringify([
            category.name,
            category.slug,
            category.description,
          ])}
          action={updateCategory}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="categoryId"
            value={category.id}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              name="name"
              defaultValue={category.name}
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
              defaultValue={category.slug}
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
                category.description ?? ""
              }
              rows={5}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded border px-4 py-2"
          >
            Save Category
          </button>
        </form>
      </div>
    </div>
  );
}