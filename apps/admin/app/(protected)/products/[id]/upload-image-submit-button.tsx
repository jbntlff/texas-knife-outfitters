"use client";

import { useFormStatus } from "react-dom";

export function UploadImageSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer rounded border px-4 py-2 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Uploading..." : "Upload Image"}
    </button>
  );
}
