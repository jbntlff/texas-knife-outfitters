"use client";

import { useEffect, useState } from "react";

import type { getActiveReviews } from "@tkb/database";
import { StarRating } from "@tkb/ui";

type Review = Awaited<ReturnType<typeof getActiveReviews>>[number];

// Fixed regardless of review count: adding more reviews only makes a full
// rotation longer, never faster per-review (unlike a fixed-duration marquee).
const DISPLAY_MS = 7000;
const TRANSITION_MS = 600;
const CARD_HEIGHT = 260;

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex flex-col justify-center rounded-2xl border bg-background p-6 shadow-sm"
      style={{ height: CARD_HEIGHT }}
    >
      <StarRating rating={review.rating} />

      <p className="mt-3 text-sm leading-6 text-foreground line-clamp-4">
        &ldquo;{review.quote}&rdquo;
      </p>

      <p className="mt-4 text-sm font-semibold tracking-tight text-foreground">
        {review.reviewer_name}
      </p>

      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {review.role}
      </p>
    </div>
  );
}

export function TkoReviews({
  reviews,
}: {
  reviews: Review[];
}) {
  const [step, setStep] = useState(0);
  const [skipTransition, setSkipTransition] = useState(false);

  useEffect(() => {
    if (reviews.length < 2) {
      return;
    }

    if (step === reviews.length) {
      const timer = setTimeout(() => {
        setSkipTransition(true);
        setStep(0);
      }, TRANSITION_MS);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setStep((current) => current + 1);
    }, DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [step, reviews.length]);

  useEffect(() => {
    if (!skipTransition) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setSkipTransition(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [skipTransition]);

  if (reviews.length === 0) {
    return null;
  }

  // Row order is reverse-chronological with the first review duplicated at
  // the top: this lets `step` climb from 0 to reviews.length and animate
  // smoothly the whole way, including the final loop-back frame, which then
  // snaps to step 0 invisibly (same review, so the jump is unseen).
  const rows = [reviews[0], ...[...reviews].reverse()];
  const offset = (step - reviews.length) * CARD_HEIGHT;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          TKO Reviews
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          What the community is saying about Texas Knife Outfitters
        </h2>
      </div>

      <div
        className="relative mx-auto mt-10 max-w-xl overflow-hidden"
        style={{ height: CARD_HEIGHT }}
      >
        <div
          className={
            skipTransition
              ? ""
              : "transition-transform duration-500 ease-in-out"
          }
          style={{ transform: `translateY(${offset}px)` }}
        >
          {rows.map((review, index) => (
            <div key={index} style={{ height: CARD_HEIGHT }}>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
