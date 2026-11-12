import Link from "next/link";

import { getAdminUsers } from "@tkb/database";

import packageJson from "../../../package.json";

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
    </div>
  );
}
