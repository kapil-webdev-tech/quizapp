"use client";

import Link from "next/link";
import { BookOpen, Layers, ArrowRight } from "lucide-react";

export function AdminDashboardAccess() {
  return (
    <section className="relative mt-16 overflow-hidden rounded-[48px] border border-white/10 bg-slate-950 p-8 text-white shadow-[0_64px_120px_-32px_rgba(0,0,0,0.5)] sm:p-14 lg:mt-24">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 backdrop-blur-md">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/70">Admin Portal</span>
          </div>
          
          <h2 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
            Architect the <br /> 
            <span className="text-amber-400">Future</span> of Learning.
          </h2>
          
          <p className="max-w-xl text-xl leading-relaxed text-slate-400/90 font-medium">
            Take command of the educational core. Define exams, map complex subjects, 
            and structure granular topics for our student base.
          </p>

          <Link
            href="/admin/syllabus"
            className="group inline-flex items-center gap-3 rounded-full bg-amber-400 px-8 py-4 text-sm font-black text-slate-950 transition-all hover:scale-[1.03] active:scale-95 hover:shadow-[0_20px_40px_-8px_rgba(251,191,36,0.3)] shadow-lg"
          >
            Enter Syllabus Management
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2 lg:max-w-md">
          <Link
            href="/admin/syllabus"
            className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.03] p-8 transition-all hover:bg-white/[0.06] hover:border-white/10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/20 group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <p className="text-2xl font-bold">Syllabus</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400 font-medium">Full CRUD control over exams, subjects and topic mappings.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Manage Now <ArrowRight className="h-3 w-3" />
            </div>
          </Link>

          <div className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.01] p-8 opacity-40 cursor-not-allowed">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <Layers className="h-7 w-7" />
            </div>
            <div>
              <p className="text-2xl font-bold">Content</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">Bulk management for quiz questions and sets.</p>
            </div>
            <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
