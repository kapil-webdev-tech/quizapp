"use client";
import SectionShell from "@/components/ui/section/section-shell";
import { useSupabaseSession } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { STUDIO_PATHS } from "../../constants/studio-paths";
import { StudioPathCard } from "./studio-card-path";

export function StudioEntry() {
  const router = useRouter();
  const { session } = useSupabaseSession();
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  useEffect(() => {
    if (editSlug) {
      router.replace(`/studio/manual?edit=${encodeURIComponent(editSlug)}`);
    }
  }, [editSlug, router]);

  const openWorkflow = (path: string, loginMessage?: string) => {
    if (!session && loginMessage) {
      setError(loginMessage);
      return;
    }

    setError(null);
    router.push(path);
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <SectionShell
        title="Choose How You Want To Create"
        description="Pick one entry path first. The studio will then guide you in sequence."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STUDIO_PATHS.map((item) => (
            <StudioPathCard
              key={item.path}
              label={item.label}
              title={item.title}
              description={item.description}
              href={item.type === "link" ? item.path : undefined}
              onClick={
                item.type === "button"
                  ? () => openWorkflow(item.path, item.loginMessage)
                  : undefined
              }
            />
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
