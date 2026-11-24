
import { createAdminClient } from "./admin-client";

export async function getAllProducts() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      categories (*),
      product_attributes(*),
      product_images(*),
      product_variants(
        *,
        inventory(*),
        variant_options(*)
      )
    `)
    .order("name");

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
  return data;
}

export async function getProducts() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      categories (*),
      product_attributes(*),
      product_images(*),
      product_variants(
        *,
        inventory(*),
        variant_options(*)
      )
    `)
    .eq("status", "active")
    // Gallery pieces are display-only and never listed in the shop.
    .eq("show_in_gallery", false)
    .order("name");

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
  return data;
}

export async function getProductsBySeries(series: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      categories (*),
      product_attributes(*),
      product_images(*),
      product_variants(
        *,
        inventory(*),
        variant_options(*)
      )
    `)
    .eq("status", "active")
    // Gallery pieces are display-only and never listed in the shop.
    .eq("show_in_gallery", false)
    .eq("series", series)
    .order("name");

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
  return data;
}

export async function getGalleryProducts() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      product_images(*)
    `)
    .eq("status", "active")
    .eq("show_in_gallery", true)
    .order("name");

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
  return data;
}

export async function getProductById(
  productId: string,
) {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("products")
      .select(`
        *,
        brands(*),
        categories(*),
        product_images(*),
        product_attributes(*),
        product_variants(
          *,
          inventory(*),
          variant_options(*)
        )
      `)
      .eq("id", productId)
      .single();

  if (error) {
    throw error;
  }

  return data;
}



export async function getProductBySlug(slug: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      categories (*),
      product_attributes(*),
      product_variants (
      *,
      inventory(*),
      variant_options(*)
      ),
      product_images (*)
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }

  return data;
}


export async function getProductsByBrandSlug(slug: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (
      id,
      name,
      slug
      ),
      categories (
      id,
      name,
      slug
      ),
      product_attributes(*),
      product_images (*),
      product_variants (
       *,
       inventory(*),
        variant_options(*)
      )
    `)
    .eq("status", "active")
    // Gallery pieces are display-only and never listed in the shop.
    .eq("show_in_gallery", false)
    .eq("brands.slug", slug);

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }

  return data;
}


export async function getBrandBySlug(slug: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getProductsByBrandId(brandId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      categories (*),
      product_attributes(*),
      product_images (*),
      product_variants (
        *,
        inventory(*),
        variant_options(*)
      )
    `)
    .eq("status", "active")
    // Gallery pieces are display-only and never listed in the shop.
    .eq("show_in_gallery", false)
    .eq("brand_id", brandId);

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }

  return data;
}


export async function getCategoryBySlug(slug: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getProductsByCategoryId(categoryId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (*),
      categories (*),
      product_attributes(*),
      product_images (*),
      product_variants (
        *,
        inventory(*),
        variant_options(*)
      )
    `)
    .eq("status", "active")
    // Gallery pieces are display-only and never listed in the shop.
    .eq("show_in_gallery", false)
    .eq("category_id", categoryId);

  if (error) {
    console.error(
      "SUPABASE ERROR:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
  return data;
}

export async function updateVariantInventory(
  variantId: string,
  quantity: number,
) {
  const supabase =
    createAdminClient();

  const { error } =
    await supabase
      .from("product_variants")
      .update({
        inventory_quantity:
          quantity,
      })
      .eq("id", variantId);

  if (error) {
    throw error;
  }
}

export async function getInventoryMetrics() {
  const supabase =
    createAdminClient();

  const { data: products } =
    await supabase
      .from("products")
      .select("id");

  const { data: variants } =
    await supabase
      .from("product_variants")
      .select(`
        id,
        inventory(
          quantity,
          low_stock_threshold
        )
      `);

  const productCount =
    products?.length ?? 0;

  const variantCount =
    variants?.length ?? 0;

  const totalUnits =
    variants?.reduce(
      (total, variant) =>
        total +
        (variant.inventory
          ?.quantity ?? 0),
      0,
    ) ?? 0;

  const lowStockCount =
    variants?.filter(
      (variant) => {
        const quantity =
          variant.inventory
            ?.quantity ?? 0;

        const threshold =
          variant.inventory
            ?.low_stock_threshold ?? 2;

        return (
          quantity > 0 &&
          quantity <= threshold
        );
      },
    ).length ?? 0;


  const outOfStockCount =
    variants?.filter(
      (variant) =>
        (
          variant.inventory
            ?.quantity ?? 0
        ) === 0,
    ).length ?? 0;

  return {
    productCount,
    variantCount,
    totalUnits,
    lowStockCount,
    outOfStockCount,
  };
}

export async function getInventoryAlerts() {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("product_variants")
      .select(`
        *,
        products(
          id,
          name,
          slug
        ),
        inventory(
          quantity,
          low_stock_threshold
        )
      `)
      .eq("active", true);

  if (error) {
    throw error;
  }

  return (
    data
      ?.filter((variant) => {
        const quantity = variant.inventory ?.quantity ?? 0;

        const threshold = variant.inventory ?.low_stock_threshold ?? 2;

        return (
          quantity === 0 ||
          quantity <= threshold
        );
      })
      .sort((a, b) => {
        const aQty = a.inventory?.quantity ?? 0;
        const bQty = b.inventory?.quantity ?? 0;
        return aQty - bQty;

      }) ?? []
  );
}


export async function productHasOrders(
  productId: string,
) {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("order_items")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("product_id", productId);

  if (error) throw error;

  return (count ?? 0) > 0;
}

export async function deleteProduct(
  productId: string,
) {
  const hasOrders =
    await productHasOrders(
      productId,
    );

  if (hasOrders) {
    throw new Error(
      "This product has been ordered and cannot be deleted.",
    );
  }

  const supabase =
    createAdminClient();

  const { error } =
    await supabase
      .from("products")
      .delete()
      .eq("id", productId);

  if (error) {
    throw error;
  }
}

export async function variantHasOrders(
  variantId: string,
) {
  const supabase =
    createAdminClient();

  const { count, error } =
    await supabase
      .from("order_items")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "variant_id",
        variantId,
      );

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}


export async function deleteVariant(
  variantId: string,
) {
  const supabase =
    createAdminClient();

  const hasOrders =
    await variantHasOrders(
      variantId,
    );

  if (hasOrders) {
    throw new Error(
      "This variant has been ordered and cannot be deleted.",
    );
  }

  const {
    data: variant,
    error: variantError,
  } = await supabase
    .from("product_variants")
    .select("id, product_id")
    .eq("id", variantId)
    .single();

  if (variantError) {
    throw variantError;
  }

  const {
    count,
    error: countError,
  } = await supabase
    .from("product_variants")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "product_id",
      variant.product_id,
    );

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) <= 1) {
    throw new Error(
      "A product must have at least one variant.",
    );
  }

  const { error } =
    await supabase
      .from("product_variants")
      .delete()
      .eq(
        "id",
        variantId,
      );

  if (error) {
    throw error;
  }
}