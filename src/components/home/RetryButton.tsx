"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Icon from "@/components/icons";

export default function RetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      aria-busy={pending}
      className="btn btn-secondary mt-6"
    >
      <Icon name="rotate-cw" className={pending ? "animate-spin" : ""} />
      Pokušaj ponovo
    </button>
  );
}
