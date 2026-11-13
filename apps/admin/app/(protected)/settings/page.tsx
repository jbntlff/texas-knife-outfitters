import Link from "next/link";

import { getAdminUsers, getReviews } from "@tkb/database";
import { StarRating } from "@tkb/ui";

import packageJson from "../../../package.json";
import {
  createReview,
  moveReviewDown,
  moveReviewUp,
} from "./actions";
import { DeleteReviewButton } from "./delete-review-button";

function formatBuildTime(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function SettingsPage() {
  const gitSha = process.env.GIT_SHA;
  const buildTime = formatBuildTime(
    process.env.BUILD_TIME,
  );

  const admins = await getAdminUsers();
  const reviews = await getReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="text-muted-foreground">
          Application information.
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Version
        </h2>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              App version
            </dt>

            <dd className="font-medium">
              {packageJson.version}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              Commit
            </dt>

            <dd className="font-mono font-medium">
              {gitSha ?? "local dev"}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              Deployed
            </dt>

            <dd className="font-medium">
              {buildTime ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border">
        <div className="p-6 pb-0">
          <h2 className="text-xl font-semibold">
            Admins
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Accounts with admin access. Demote one
            from its profile page.
          </p>
        </div>

        <table className="mt-4 w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">
                Name
              </th>
              <th className="p-4 text-left">
                Email
              </th>
              <th className="p-4 text-left">
                Role
              </th>
            </tr>
          </thead>

          <tbody>
            {admins.map((admin) => (
              <tr
                key={admin.id}
                className="border-b last:border-b-0"
              >
                <td className="p-4">
                  <Link
                    href={`/customers/${admin.id}`}
                    className="font-medium hover:underline"
                  >
                    {admin.first_name}{" "}
                    {admin.last_name}
                  </Link>
                </td>

                <td className="p-4">
                  {admin.email}
                </td>

                <td className="p-4">
                  <span className="rounded-full border px-2 py-1 text-xs font-medium">
                    {admin.role}
                  </span>
                </td>
              </tr>
            ))}

            {admins.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-4 text-center text-sm text-muted-foreground"
                >
                  No admins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Reviews
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Shown as the TKO Reviews carousel on the brochure
          homepage. Only active reviews appear there.
        </p>

        <form
          action={createReview}
          className="space-y-4"
        >
          <input
            name="reviewerName"
            placeholder="Reviewer Name"
            className="w-full rounded border px-3 py-2"
            required
          />

          <input
            name="role"
            placeholder="Role (e.g. Customer, Knife Maker)"
            className="w-full rounded border px-3 py-2"
            required
          />

          <textarea
            name="quote"
            placeholder="Review text"
            rows={3}
            className="w-full rounded border px-3 py-2"
            required
          />

          <select
            name="rating"
            defaultValue="5"
            className="w-full rounded border px-3 py-2"
            required
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded border px-4 py-2"
          >
            Add Review
          </button>
        </form>

        <table className="mt-6 w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Rating</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Order</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((review, index) => (
              <tr
                key={review.id}
                className="border-b last:border-b-0"
              >
                <td className="p-4">
                  {review.reviewer_name}
                </td>

                <td className="p-4 text-sm text-muted-foreground">
                  {review.role}
                </td>

                <td className="p-4">
                  <StarRating rating={review.rating} />
                </td>

                <td className="p-4">
                  <span className="rounded-full border px-2 py-1 text-xs font-medium">
                    {review.is_active ? "Active" : "Hidden"}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="inline-flex gap-1">
                    <form action={moveReviewUp}>
                      <input
                        type="hidden"
                        name="reviewId"
                        value={review.id}
                      />
                      <button
                        type="submit"
                        disabled={index === 0}
                        className="rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ▲
                      </button>
                    </form>

                    <form action={moveReviewDown}>
                      <input
                        type="hidden"
                        name="reviewId"
                        value={review.id}
                      />
                      <button
                        type="submit"
                        disabled={index === reviews.length - 1}
                        className="rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ▼
                      </button>
                    </form>
                  </div>
                </td>

                <td className="p-4 text-right">
                  <div className="inline-flex gap-2">
                    <Link
                      href={`/settings/reviews/${review.id}`}
                      className="rounded border px-2 py-1 text-xs hover:bg-muted"
                    >
                      Edit
                    </Link>

                    <DeleteReviewButton
                      reviewId={review.id}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {reviews.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-sm text-muted-foreground"
                >
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
