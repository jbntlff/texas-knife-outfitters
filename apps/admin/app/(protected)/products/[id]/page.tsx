import { notFound } from "next/navigation";
import { getProductById, getBrands, getCategories } from "@tkb/database";
import {
  formatPrice,
  resolveProductImageUrl,
} from "@tkb/ui";

import {
  updateInventory,
  updateProduct,
  createVariant,
  uploadProductImage,
  deleteProductImage,
  createVariantOption,
  deleteVariantOption,
  createProductAttribute,
  deleteProductAttribute,
  moveImageDown,
  moveImageUp,
} from "./actions";
import { DeleteVariantButton } from "./delete-variant-button";
import { UploadImageSubmitButton } from "./upload-image-submit-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  const brands = await getBrands();
  const categories = await getCategories();


  if (!product) {
    notFound();
  }
  const images =
    [...(product.product_images ?? [])]
      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order,
      );

  const attributes =
    [...(product.product_attributes ?? [])]
      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order,
      );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {product.name}
        </h1>

        <p className="text-muted-foreground">
          {product.slug}
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">
              Brand
            </div>

            <div className="font-medium">
              {product.brands?.name}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Category
            </div>

            <div className="font-medium">
              {product.categories?.name}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Status
            </div>

            <div className="font-medium">
              {product.status}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Product Information
        </h2>

        <form
          action={updateProduct}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="productId"
            value={product.id}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              name="name"
              defaultValue={product.name}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Slug
            </label>

            <input
              name="slug"
              defaultValue={product.slug}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Short Description
            </label>

            <textarea
              name="shortDescription"
              defaultValue={
                product.short_description ?? ""
              }
              rows={3}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              defaultValue={
                product.description ?? ""
              }
              rows={6}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Brand
              </label>

              <select
                name="brandId"
                defaultValue={
                  product.brand_id ?? ""
                }
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
                defaultValue={
                  product.category_id ?? ""
                }
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                name="status"
                defaultValue={
                  product.status
                }
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

            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={
                  product.featured
                }
              />

              <label>
                Featured Product
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Series
            </label>

            <select
              name="series"
              defaultValue={
                product.series ?? ""
              }
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
              name="showInGallery"
              defaultChecked={
                product.show_in_gallery
              }
            />

            <label>
              Show in Gallery
            </label>
          </div>

          <button
            type="submit"
            className="cursor-pointer rounded border px-4 py-2"
          >
            Save Product
          </button>
        </form>
      </div>

      <div className="rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Images
          </h2>

          <span className="text-sm text-muted-foreground">
            {product.product_images?.length ?? 0}
            {" "}
            image(s)
          </span>
        </div>

        <form
          action={uploadProductImage}
          className="mt-4 space-y-4"
        >
          <input
            type="hidden"
            name="productId"
            value={product.id}
          />

          <div>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="altText"
              placeholder="Alt text"
              className=" w-full rounded border px-3 py-2 "
            />
          </div>

          <UploadImageSubmitButton />
        </form>

        {product.product_images?.length ? (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map(
              (image, index,) => {
                const imageSrc =
                  resolveProductImageUrl(
                    image.image_url,
                  );

                return (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded border"
                  >
                    {index === 0 && (
                      <div className="bg-green-600 px-2 py-1 text-center text-xs font-medium text-white ">
                        PRIMARY
                      </div>
                    )}
                    <img
                      src={imageSrc}
                      alt={
                        image.alt_text ??
                        product.name
                      }
                      className="h-40 w-full object-cover"
                    />
                    <div className="border-t p-2 text-xs text-muted-foreground">
                      {image.alt_text ??
                        "No alt text"}
                    </div>
                    <div className="border-t p-2 flex gap-2">
                      <form action={moveImageUp}>
                        <input
                          type="hidden"
                          name="imageId"
                          value={image.id}
                        />

                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />

                        <button
                          type="submit"
                          className="rounded border px-2 py-1 text-xs"
                        >
                          ↑
                        </button>
                      </form>

                      <form action={moveImageDown}>
                        <input
                          type="hidden"
                          name="imageId"
                          value={image.id}
                        />

                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />

                        <button
                          type="submit"
                          className="rounded border px-2 py-1 text-xs"
                        >
                          ↓
                        </button>
                      </form>
                    </div>


                    <form
                      action={deleteProductImage}
                      className="border-t p-2"
                    >
                      <input
                        type="hidden"
                        name="imageId"
                        value={image.id}
                      />

                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />

                      <input
                        type="hidden"
                        name="imageUrl"
                        value={image.image_url}
                      />

                      <button
                        type="submit"
                        className=" w-full rounded border px-2 py-1 text-xs hover:bg-muted "
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                );
              },
            )}

          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No images uploaded.
          </p>
        )}
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Specifications
        </h2>

        <form
          action={createProductAttribute}
          className="flex flex-wrap items-end gap-2"
        >
          <input
            type="hidden"
            name="productId"
            value={product.id}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              name="attributeName"
              placeholder="Blade Length"
              required
              className="rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Value
            </label>

            <input
              name="attributeValue"
              placeholder="3.44&quot;"
              required
              className="rounded border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded border px-4 py-2"
          >
            Add Specification
          </button>
        </form>

        {attributes.length ? (
          <div className="mt-4 overflow-hidden rounded-lg border">
            {attributes.map((attribute) => (
              <div
                key={attribute.id}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 border-b px-4 py-2 last:border-b-0"
              >
                <div className="font-medium">
                  {attribute.attribute_name}
                </div>

                <div className="text-sm text-muted-foreground">
                  {attribute.attribute_value}
                </div>

                <form action={deleteProductAttribute}>
                  <input
                    type="hidden"
                    name="attributeId"
                    value={attribute.id}
                  />

                  <input
                    type="hidden"
                    name="productId"
                    value={product.id}
                  />

                  <button
                    type="submit"
                    className="rounded border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No specifications added.
          </p>
        )}
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Add Variant
        </h2>

        <form
          action={createVariant}
          className="grid gap-4 md:grid-cols-2"
        >
          <input
            type="hidden"
            name="productId"
            value={product.id}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              SKU
            </label>

            <input
              name="sku"
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Title
            </label>

            <input
              name="title"
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Price
            </label>

            <input
              type="number"
              step="0.01"
              name="price"
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Compare At Price
            </label>

            <input
              type="number"
              step="0.01"
              name="compareAtPrice"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Low Stock Threshold
            </label>

            <input
              type="number"
              name="lowStockThreshold"
              defaultValue={2}
              min="0"
              className="w-full rounded border px-3 py-2"
            />
          </div>




          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              defaultChecked
            />

            <label>
              Active
            </label>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className=" rounded border px-4 py-2 "
            >
              Create Variant
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border">
        <div className="border-b p-4">
          <h2 className="font-semibold">
            Variants
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">
                SKU
              </th>
              <th className="p-4 text-left">
                Title
              </th>
              <th className="p-4 text-right">
                Price
              </th>
              <th className="p-4 text-right">
                Inventory
              </th>
              <th className="p-4 text-center">
                Status
              </th>
              <th className="p-4 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {product.product_variants?.map(
              (variant) => {
                const quantity = variant.inventory?.quantity ?? 0;
                const threshold = variant.inventory?.low_stock_threshold ?? 2;

                return (
                  <tr
                    key={variant.id}
                    className="border-b"
                  >
                    <td className="p-4">
                      {variant.sku}
                    </td>

                    <td className="p-4">
                      <div>
                        {variant.title}
                      </div>
                      <div className="mt-1 space-y-1 text-xs">
                        {variant.variant_options?.map(
                          (option) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-2"
                            >
                              <span>
                                {option.option_name}:{" "}
                                {option.option_value}
                              </span>

                              <form
                                action={
                                  deleteVariantOption
                                }
                              >
                                <input
                                  type="hidden"
                                  name="optionId"
                                  value={option.id}
                                />
                                <input
                                  type="hidden"
                                  name="productId"
                                  value={product.id}
                                />
                                <button
                                  type="submit"
                                  className="text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </form>
                            </div>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {formatPrice(variant.price,)}
                    </td>
                    <td className="p-4">
                      <form
                        action={updateInventory}
                        className="flex items-center justify-end gap-2"
                      >
                        <input
                          type="hidden"
                          name="variantId"
                          value={variant.id}
                        />
                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />
                        <input
                          type="number"
                          name="quantity"
                          defaultValue={
                            variant.inventory?.quantity ?? 0
                          }
                          className="w-20 rounded border px-2 py-1 text-right"
                        />
                        <button
                          type="submit"
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Save
                        </button>
                      </form>

                      <div className="mt-2">
                        <form
                          action={createVariantOption}
                          className="flex flex-wrap gap-2"
                        >
                          <input
                            type="hidden"
                            name="productId"
                            value={product.id}
                          />
                          <input
                            type="hidden"
                            name="variantId"
                            value={variant.id}
                          />
                          <input
                            name="optionName"
                            placeholder="Name"
                            className="w-24 rounded border px-2 py-1 text-xs"
                          />
                          <input
                            name="optionValue"
                            placeholder="Value"
                            className="w-24 rounded border px-2 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            className="rounded border px-2 py-1 text-xs"
                          >
                            Add
                          </button>
                        </form>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {quantity === 0 ? (
                        <span className="font-medium text-red-500">
                          Out of Stock
                        </span>
                      ) : quantity <= threshold ? (
                        <span className="font-medium text-yellow-500">
                          Low Stock
                        </span>
                      ) : (
                        <span className="font-medium text-green-600">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <DeleteVariantButton
                        variantId={variant.id}
                        productId={product.id}
                        disabled={
                          product.product_variants.length <= 1
                        }
                      />
                    </td>

                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}