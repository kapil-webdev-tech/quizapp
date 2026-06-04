import { HeaderBreadcrumb } from "@/components/header-breadcrumb";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthStatus } from "@/features/auth/auth-status";
import { MobileTabBar } from "@/components/mobile-tab-bar";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/active-recall", label: "Practice Active Recall" },
  { href: "/studio", label: "AI Studio" },
  { href: "/revision", label: "Revision" },
  { href: "/login", label: "Account" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(253,230,138,0.35),_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f7f1dd_58%,_#efe4c2_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-6 lg:px-10">
        <header className="mb-6 flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white/75 px-4 py-4 shadow-[0_20px_80px_rgba(112,79,22,0.08)] backdrop-blur sm:mb-8 sm:gap-5 sm:rounded-[28px] sm:px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-700 sm:text-xs sm:tracking-[0.35em]">
              UPSC Quiz Lab
            </Link>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Mock prelims, topic drills, revision snapshots, and AI-generated custom tests in one workspace.
            </p>
            <HeaderBreadcrumb />
          </div>
          <div className="flex flex-col gap-3 md:max-w-[460px] md:items-end">
            <nav className="-mx-1 hidden snap-x gap-2 overflow-x-auto px-1 pb-1 text-sm font-medium md:mx-0 md:flex md:flex-wrap md:justify-end md:overflow-visible md:px-0 md:pb-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 snap-start rounded-full border border-black/10 bg-white px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <AuthStatus />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
