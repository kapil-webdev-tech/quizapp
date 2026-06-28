"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "../ui/modal/modal";

type BulkImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  onImport: (
    rows: {
      name_en: string;
      name_hi: string;
    }[],
  ) => Promise<void>;
};

export function BulkImportModal({
  isOpen,
  onClose,
  entityName,
  onImport,
}: BulkImportModalProps) {
  const [value, setValue] = useState("");

  async function handleImport() {
    const rows = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name_en, name_hi] = line.split("|");

        return {
          name_en: name_en?.trim() ?? "",
          name_hi: name_hi?.trim() ?? "",
        };
      })
      .filter((row) => row.name_en);

    await onImport(rows);

    setValue("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Import ${entityName}`}
      subtitle="Import multiple items at once. Enter one item per line."
      width="sm:max-w-4xl"
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="rounded-full font-bold text-slate-500 hover:bg-slate-100 h-11 sm:h-10"
          >
            Cancel
          </Button>

          <Button 
            onClick={handleImport} 
            className="rounded-full bg-slate-900 px-8 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 hover:bg-slate-800 h-11 sm:h-10"
          >
            Import {entityName}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 sm:space-y-6">
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-[280px] sm:min-h-[350px] rounded-2xl border-slate-200 bg-slate-50/50 p-4 sm:p-6 font-mono text-xs sm:text-sm focus-visible:border-slate-400 focus-visible:ring-0 transition-all no-scrollbar"
            placeholder={`Parliament|संसद\nPresident|राष्ट्रपति\nPrime Minister|प्रधानमंत्री`}
          />
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 pointer-events-none bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
            English|Hindi
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Format Guide
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-blue-600/80">
            Use the pipe symbol <code className="mx-1 rounded bg-blue-100 px-1 py-0.5 font-bold text-blue-800">|</code> to separate English and Hindi names. Every line represents one entry.
          </p>
        </div>
      </div>
    </Modal>
  );
}
