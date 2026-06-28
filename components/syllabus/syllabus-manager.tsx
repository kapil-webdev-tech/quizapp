"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamsTab } from "./exams-tab";
import { SubjectsTab } from "./subjects-tab";
import { TopicsTab } from "./topics-tab";
import { MappingsTab } from "./mappings-tab";
import { ExplorerTab } from "./explorer-tab";
import { Button } from "../ui/button";
import { resetSyllabus } from "@/lib/syllabus/admin";
import { ConfirmationModal } from "../ui/modal/confirmation-modal";
import { RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

export function SyllabusManager() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleReset() {
    setIsResetting(true);
    try {
      await resetSyllabus();
      toast.success("Syllabus reset successfully");
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset syllabus",
      );
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  }

  const tabItems = [
    { value: "exams", label: "Exams" },
    { value: "subjects", label: "Subjects" },
    { value: "topics", label: "Topics" },
    { value: "mappings", label: "Mappings" },
    { value: "explorer", label: "Explorer" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 py-6 sm:py-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[48px] border border-white/5 bg-slate-950 p-8 text-white shadow-[0_64px_120px_-32px_rgba(0,0,0,0.5)] sm:p-14">
        {/* Decorative Blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

        <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">
                Admin Authority
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-2xl font-black leading-tight tracking-tight text-transparent sm:text-4xl">
                Syllabus <br />
                <span className="text-blue-400">Management</span>
              </h1>
              <p className="max-w-lg text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
                Engine-room for the learning framework. Manage the hierarchical
                data structure that powers our study experience.
              </p>
            </div>
          </div>

          <div className="flex shrink-0">
            <Button
              variant="ghost"
              onClick={() => setIsResetModalOpen(true)}
              className="group h-11 rounded-xl border border-white/10 bg-white/5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-rose-500 hover:bg-rose-600 hover:text-white active:scale-95 sm:h-12"
            >
              <RefreshCcw className="mr-2 h-3.5 w-3.5 duration-700 transition-transform group-hover:rotate-180" />
              Nuclear Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="rounded-[44px] border border-black/[0.03] bg-white/50 p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] backdrop-blur-3xl sm:p-5">
        <Tabs defaultValue="exams" className="space-y-10">
          <div className="sticky top-0 z-20 px-1 pt-2 sm:px-2">
            <TabsList className="no-scrollbar flex w-full items-center justify-start overflow-x-auto rounded-[28px] border border-black/5 bg-white/95 p-1.5 ring-1 ring-white/50 backdrop-blur-xl shadow-xl sm:justify-center">
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "min-w-[95px] flex-1 rounded-[22px] py-3.5 font-black text-[9px]  tracking-[0.15em] transition-all duration-300 sm:min-w-0 sm:text-[11px] sm:tracking-[0.2em]",
                    "data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.12)] data-[state=active]:ring-1 data-[state=active]:ring-black/5",
                    "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50",
                  )}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="px-1 pb-2 sm:px-4 sm:pb-4">
            <TabsContent
              value="exams"
              className="mt-0 animate-in fade-in slide-in-from-bottom-3 outline-none duration-700 ease-out"
            >
              <ExamsTab />
            </TabsContent>
            <TabsContent
              value="subjects"
              className="mt-0 animate-in fade-in slide-in-from-bottom-3 outline-none duration-700 ease-out"
            >
              <SubjectsTab />
            </TabsContent>
            <TabsContent
              value="topics"
              className="mt-0 animate-in fade-in slide-in-from-bottom-3 outline-none duration-700 ease-out"
            >
              <TopicsTab />
            </TabsContent>
            <TabsContent
              value="mappings"
              className="mt-0 animate-in fade-in slide-in-from-bottom-3 outline-none duration-700 ease-out"
            >
              <MappingsTab />
            </TabsContent>
            <TabsContent
              value="explorer"
              className="mt-0 animate-in fade-in slide-in-from-bottom-3 outline-none duration-700 ease-out"
            >
              <ExplorerTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Wipe Confirmation */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
        title="Wipe Entire Syllabus?"
        description="This will instantly purge all exams, subjects, topics, and subtopic mappings from the cloud database. There is no backup for this action."
        confirmLabel="Destroy All Data"
        cancelLabel="Keep Syllabus"
        isLoading={isResetting}
        variant="danger"
      />
    </div>
  );
}
