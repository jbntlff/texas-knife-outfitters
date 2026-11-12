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

export default function SettingsPage() {
  const gitSha = process.env.GIT_SHA;
  const buildTime = formatBuildTime(
    process.env.BUILD_TIME,
  );

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
    </div>
  );
}
