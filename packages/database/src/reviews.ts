import { createAdminClient }
  from "./admin-client";

export async function getReviews() {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("reviews")
      .select("*")
      .order("display_order");

  if (error) {
    throw error;
  }

  return data;
}

export async function getActiveReviews() {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("reviews")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

  if (error) {
    throw error;
  }

  return data;
}

export async function getReviewById(
  reviewId: string,
) {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

  if (error) {
    throw error;
  }

  return data;
}
