import { createProduct, } from "./actions";
import { getBrands, getCategories } from "@tkb/database";


export default async function NewProductPage() {
  const brands = await getBrands();
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          New Product
        </h1>

        <p className="text-muted-foreground">
          Create a new product.
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <form
          action={createProduct}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              name="name"
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Slug
            </label>

            <input
              name="slug"
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Brand
            </label>

            <select
              name="brandId"
              defaultValue=""
              className="w-full rounded border px-3 py-2"
            >
              <option value="">
                Select Brand
              </option>

              {brands.map((brand) => (
                <option
                  key={brand.id}
                  value={brand.id}
                >
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>

            <select
              name="categoryId"
              defaultValue=""
              className="w-full rounded border px-3 py-2"
            >
              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              name="status"
              defaultValue="draft"
              className="w-full rounded border px-3 py-2"
            >
              <option value="draft">
                Draft
              </option>

              <option value="active">
                Active
              </option>

              <option value="archived">
                Archived
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Series
            </label>

            <select
              name="series"
              defaultValue=""
              className="w-full rounded border px-3 py-2"
            >
              <option value="">
                Select Series
              </option>

              <option value="legacy">
                Legacy Series
              </option>

              <option value="performance">
                Performance Series
              </option>

              <option value="signature_series">
                Signature Series
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
            />

            <label>
              Feature on storefront home page
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="showInGallery"
            />

            <label>
              Show in Gallery (display only, not for sale)
            </label>
          </div>

          <button
            type="submit"
            className="
              rounded
              border
              px-4
              py-2
            "
          >
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
}