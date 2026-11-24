import { createAdminClient } from "./admin-client";

export async function getSearchProducts(
  query: string,
) {
  const supabase = createAdminClient();

  const term = query.trim();

  if (!term) {
    return [];
  }

  const {
    data: matchingProducts,
    error,
  } = await supabase.rpc(
    "search_products",
    {
      search_query: term,
    },
  );

  if (error) {
    console.error(
      "SUPABASE SEARCH ERROR:",
      JSON.stringify(error, null, 2),
    );

    throw error;
  }

  const ids =
    matchingProducts?.map(
      (product) => product.id,
    ) ?? [];

  if (ids.length === 0) {
    return [];
  }

  const {
    data: products,
    error: productsError,
  } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      categories (*),
      product_attributes(*),
      product_images(*),
      product_variants(
        *,
        variant_options(*)
      )
    `)
    .eq("status", "active")
    // Search deliberately includes gallery (display-only) pieces; the
    // results label them as not for sale.
    .in("id", ids);

  if (productsError) {
    console.error(
      "SUPABASE SEARCH PRODUCTS ERROR:",
      JSON.stringify(productsError, null, 2),
    );

    throw productsError;
  }

  const productMap = new Map(
    (products ?? []).map((product) => [
      product.id,
      product,
    ]),
  );


  return ids
    .map((id) => productMap.get(id))
    .filter(
      (
        product,
      ): product is NonNullable<
        typeof product
      > => product !== undefined,
    );
}