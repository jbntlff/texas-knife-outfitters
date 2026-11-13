import type { getActiveReviews } from "@tkb/database";
import { StarRating } from "@tkb/ui";

type Review = Awaited<ReturnType<typeof getActiveReviews>>[number];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-80 shrink-0 rounded-2xl border bg-background p-6 shadow-sm sm:w-96">
      <StarRating rating={review.rating} />

      <p className="mt-3 text-sm leading-6 text-foreground">
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
  if (reviews.length === 0) {
    return null;
  }

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

      <div className="mt-10 overflow-hidden">
        <div className="flex w-max gap-5 animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard
              key={`${review.id}-${index}`}
              review={review}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
