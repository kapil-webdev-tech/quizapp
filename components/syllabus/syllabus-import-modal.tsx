"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Modal } from "../ui/modal/modal";

import { importSyllabus } from "@/lib/syllabus/import-syllabus";

type SyllabusImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
};

export function SyllabusImportModal({
  isOpen,
  onClose,
  onSuccess,
}: SyllabusImportModalProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    try {
      setLoading(true);

      await importSyllabus(value);

      toast.success("Syllabus imported");

      await onSuccess?.();

      setValue("");

      onClose();
    } catch (error) {
      console.error(error);

      toast.error("Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Syllabus"
     subtitle="Create subjects, topics and optional micro topics in one go."
      width="sm:max-w-5xl"
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleImport}
            disabled={!value.trim() || loading}
          >
            {loading
              ? "Importing..."
              : "Import Syllabus"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Textarea
          value={value}
          onChange={(e) =>
            setValue(e.target.value)
          }
          className="min-h-[450px] font-mono"
          placeholder={`Rajasthan Current Affairs | राजस्थान समसामयिकी:
Sports | खेल
  - Cricket | क्रिकेट
  - Volleyball | वॉलीबॉल
  - Kabaddi | कबड्डी

Indexes | सूचकांक
  - SDG Index | एसडीजी सूचकांक
  - Startup Ranking | स्टार्टअप रैंकिंग

Schemes | योजनाएँ`}
        />

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          <div className="font-semibold">
            Format
          </div>

          <div className="mt-2 whitespace-pre-wrap font-mono text-xs">
{`Subject English | Subject Hindi:
Topic English | Topic Hindi
  - Micro Topic English | Micro Topic Hindi
  - Another Micro Topic | हिन्दी

Another Topic | दूसरा विषय

• Use "|" to separate English and Hindi.
• Leave one empty line between subjects.
• Prefix micro topics with "-" and indent them.
• Micro topics are optional.`}
          </div>
        </div>
      </div>
    </Modal>
  );
}