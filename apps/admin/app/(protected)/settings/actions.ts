"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@tkb/auth/server";

import { createAdminClient, getReviews } from "@tkb/database";

export async function createReview(
  formData: FormData,
) {
  await requireAdmin();

  const reviewerName = formData.get("reviewerName") as string;
  const role = formData.get("role") as string;
  const quote = formData.get("quote") as string;
  const rating = Number(formData.get("rating"));

  const supabase = createAdminClient();

  const reviews = await getReviews();
  const nextOrder =
    reviews.reduce(
      (max, review) => Math.max(max, review.display_order),
      -1,
    ) + 1;

  const { error } = await supabase
    .from("reviews")
    .insert({
      reviewer_name: reviewerName,
      role,
      quote,
      rating,
      display_order: nextOrder,
    });

  if (error) {
    throw error;
  }

  revalidatePath("/settings");
}

export async function updateReview(
  formData: FormData,
) {
  await requireAdmin();

  const reviewId = formData.get("reviewId") as string;
  const reviewerName = formData.get("reviewerName") as string;
  const role = formData.get("role") as string;
  const quote = formData.get("quote") as string;
  const rating = Number(formData.get("rating"));
  const isActive = formData.get("isActive") === "on";

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("reviews")
    .update({
      reviewer_name: reviewerName,
      role,
      quote,
      rating,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) {
    throw error;
  }

  revalidatePath("/settings");
  revalidatePath(`/settings/reviews/${reviewId}`);
}

export async function deleteReview(
  formData: FormData,
) {
  await requireAdmin();

  const reviewId = formData.get("reviewId") as string;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    throw error;
  }

  revalidatePath("/settings");
}

async function swapReviewOrder(
  reviewId: string,
  direction: "up" | "down",
) {
  await requireAdmin();

  const reviews = await getReviews();
  const index = reviews.findIndex(
    (review) => review.id === reviewId,
  );

  if (index === -1) {
    return;
  }

  const neighborIndex =
    direction === "up" ? index - 1 : index + 1;
  const neighbor = reviews[neighborIndex];

  if (!neighbor) {
    return;
  }

  const current = reviews[index];
  const supabase = createAdminClient();

  const { error: currentError } = await supabase
    .from("reviews")
    .update({ display_order: neighbor.display_order })
    .eq("id", current.id);

  if (currentError) {
    throw currentError;
  }

  const { error: neighborError } = await supabase
    .from("reviews")
    .update({ display_order: current.display_order })
    .eq("id", neighbor.id);

  if (neighborError) {
    throw neighborError;
  }

  revalidatePath("/settings");
}

export async function moveReviewUp(
  formData: FormData,
) {
  const reviewId = formData.get("reviewId") as string;
  await swapReviewOrder(reviewId, "up");
}

export async function moveReviewDown(
  formData: FormData,
) {
  const reviewId = formData.get("reviewId") as string;
  await swapReviewOrder(reviewId, "down");
}
