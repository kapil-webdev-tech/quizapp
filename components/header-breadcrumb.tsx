"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const segmentLabels: Record<string, string> = {
  subjects: "Subjects",
  studio: "AI Studio",
  "active-recall": "Active Recall",
  revision: "Revision",
  login: "Account",
  quiz: "Quiz",
  results: "Results",
  custom: "Custom Quiz",
  "custom-results": "Custom Results",
};

function titleizeSegment(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const items = [
    { href: "/", label: "Home" },
    ...segments.map((segment, index) => ({
      href: `/${segments.slice(0, index + 1).join("/")}`,
      label: segmentLabels[segment] ?? titleizeSegment(decodeURIComponent(segment)),
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.href} className="flex items-center gap-2">
            {isLast ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{item.label}</span>
            ) : (
              <Link href={item.href} className="rounded-full px-2 py-1 transition hover:bg-stone-100 hover:text-slate-700">
                {item.label}
              </Link>
            )}
            {!isLast ? <span className="text-slate-300">/</span> : null}
          </div>
        );
      })}
    </nav>
  );
}
