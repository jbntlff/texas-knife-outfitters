"use client";

import { useTransition } from "react";

import { Button } from "@tkb/ui";

import { deleteReview } from "./actions";

type Props = {
  reviewId: string;
};

export function DeleteReviewButton({
  reviewId,
}: Props) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(formData) => {
        if (
          !window.confirm(
            "Delete this review? This cannot be undone.",
          )
        ) {
          return;
        }

        start(async () => {
          await deleteReview(formData);
        });
      }}
    >
      <input
        type="hidden"
        name="reviewId"
        value={reviewId}
      />

      <Button
        type="submit"
        variant="danger"
        disabled={pending}
      >
        {pending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  );
}
