"use client";

import { PencilLine, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { GenerationMode } from "@/lib/active-recall/types";

export function GenerationModeSwitch({
  value,
  onChange,
}: {
  value: GenerationMode;
  onChange: (value: GenerationMode) => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/40 bg-white/70 px-5 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div
          className={`flex items-center gap-2 transition-all duration-300 ${
            value === "ai"
              ? "scale-100 text-[#1f3a2f]"
              : "scale-95 text-slate-400"
          }`}
        >
          <Sparkles className="size-4" />
          <span className="text-sm font-semibold tracking-wide">
            AI Generation
          </span>
        </div>

        <Switch
          checked={value === "manual"}
          onCheckedChange={(checked) => onChange(checked ? "manual" : "ai")}
          className="data-[state=checked]:bg-[#9f2f1f] data-[state=unchecked]:bg-[#1f3a2f]"
        />

        <div
          className={`flex items-center gap-2 transition-all duration-300 ${
            value === "manual"
              ? "scale-100 text-[#9f2f1f]"
              : "scale-95 text-slate-400"
          }`}
        >
          <PencilLine className="size-4" />
          <span className="text-sm font-semibold tracking-wide">
            Manual Generation
          </span>
        </div>
      </div>
    </div>
  );
}
