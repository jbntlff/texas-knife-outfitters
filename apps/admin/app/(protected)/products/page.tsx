
import Link from "next/link";
import { ChevronRight } from "lucide-react"

import { archiveProduct, restoreProduct, deleteProductAction } from "./actions";
import { getAllProducts, } from "@tkb/database";
import { Button, } from "@tkb/ui";

import { GalleryFilter } from "@/components/products/gallery-filter";

type PageProps = {
  searchParams: Promise<{
    gallery?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const includeGallery =
    params.gallery !== "hide";

  const allProducts =
    await getAllProducts();

  const products = includeGallery
    ? allProducts
    : allProducts.filter(
      (product) => !product.show_in_gallery,
    );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="text-muted-foreground">
            Manage catalog inventory.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <GalleryFilter
            includeGallery={includeGallery}
          />

          <Link
            href="/products/new"
          className=" rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted "
        >
            New Product
          </Link>
        </div>
      </div>

      <div className="rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">
                Product
              </th>

              <th className="p-4 text-left">
                Brand
              </th>

              <th className="p-4 text-left">
                Category
              </th>

              <th className="p-4 text-left">
                Status
              </th>
              <th className="p-4 text-right">
                Inventory
              </th>
              <th className="p-4 text-right">
                Variants
              </th>
              <th className="p-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const inventory =
                product.product_variants?.reduce(
                  (total, variant) =>
                    total +
                    (variant.inventory?.quantity ?? 0),
                  0,
                ) ?? 0;
              return (
                <tr
                  key={product.id}
                  className={` border-b ${product.status ===
                    "archived"
                    ? "opacity-50"
                    : ""
                    }
                  `}
                >
                  <td className="p-4">
                    <Link href={`/products/${product.id}`}
                      className="hover:underline'"
                    >

                      <div className="flex items-center gap-2 font-medium">
                        {product.name}

                        {product.show_in_gallery && (
                          <span className="rounded-full border px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            Gallery
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {product.slug}
                      </div>
                    </Link>
                  </td>

                  <td className="p-4">
                    {product.brands?.name}
                  </td>

                  <td className="p-4">
                    {product.categories?.name}
                  </td>

                  <td className="p-4">
                    {product.status}
                  </td>
                  <td className="p-4 text-right">
                    {inventory}
                  </td>

                  <td className="p-4 text-right">
                    {
                      product
                        .product_variants
                        ?.length
                    }
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-end gap-2">

                      {product.status === "archived" ? (
                        <div className="flex gap-2">
                          <form action={restoreProduct}>
                            <input type="hidden" name="productId" value={product.id} />
                            <Button type="submit" variant="success" >
                              Restore
                            </Button>
                          </form>
                          <form action={deleteProductAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <Button type="submit" variant="danger" >
                              Delete
                            </Button>
                          </form>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <form action={archiveProduct} >
                            <input type="hidden" name="productId" value={product.id} />
                            <Button type="submit" variant="danger" >
                              Archive
                            </Button>
                          </form>
                          <form action={deleteProductAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <Button type="submit" variant="danger" >
                              Delete
                            </Button>
                          </form>
                        </div>
                      )}
                      
                    </div>
                  </td>
                </tr>
              )
            })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}