import { AppShell } from "@/components/app-shell";
import { CustomQuizList } from "@/components/custom/custom-quiz-list";
import { Hero } from "@/components/hero";
import { ServerQuizGrid } from "@/components/server-quiz-grid";
import { StatsStrip } from "@/components/stats-strip";

import { AdminDashboardAccess } from "@/components/admin-dashboard-access";

export default function Home() {
  return (
    <AppShell>
      <Hero />
      <StatsStrip />
      <AdminDashboardAccess />
      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Available Sets</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Attempt quizzes loaded from the backend</h2>
          </div>
        </div>
        <ServerQuizGrid />
      </section>
      <section className="mt-10">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">AI Generated</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Manage your saved backend quiz sets</h2>
        </div>
        <CustomQuizList />
      </section>
    </AppShell>
  );
}
