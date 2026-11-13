import { notFound } from "next/navigation";
import Link from "next/link";

import { getReviewById } from "@tkb/database";

import { updateReview } from "../../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReviewPage(
  { params }: PageProps,
) {
  const { id } = await params;

  const review = await getReviewById(id);

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Review
        </h1>

        <p className="text-muted-foreground">
          Manage this review&rsquo;s details.
        </p>

        <Link
          href="/settings"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Settings
        </Link>
      </div>

      <div className="rounded-xl border p-6">
        <form
          action={updateReview}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="reviewId"
            value={review.id}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Reviewer Name
            </label>

            <input
              name="reviewerName"
              defaultValue={review.reviewer_name}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Role
            </label>

            <input
              name="role"
              defaultValue={review.role}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Review Text
            </label>

            <textarea
              name="quote"
              defaultValue={review.quote}
              rows={5}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Rating
            </label>

            <select
              name="rating"
              defaultValue={review.rating}
              className="w-full rounded border px-3 py-2"
              required
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={review.is_active}
            />
            Active (shown on the brochure site)
          </label>

          <button
            type="submit"
            className="rounded border px-4 py-2"
          >
            Save Review
          </button>
        </form>
      </div>
    </div>
  );
}
