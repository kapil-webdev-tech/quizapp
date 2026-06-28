"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "../ui/modal/modal";
import { Field, FieldLabel } from "@/components/ui/field";

type EntityFormModalProps = {
  isOpen: boolean;
  onClose: () => void;

  entityName: string;

  initialValues?: {
    name_en?: string;
    name_hi?: string;
    description_en?: string;
    description_hi?: string;
  };

  onSubmit: (values: {
    name_en: string;
    name_hi: string;
    description_en: string;
    description_hi: string;
  }) => Promise<void>;
};

export function EntityFormModal({
  isOpen,
  onClose,
  entityName,
  initialValues,
  onSubmit,
}: EntityFormModalProps) {
  const [form, setForm] = useState({
    name_en: initialValues?.name_en ?? "",
    name_hi: initialValues?.name_hi ?? "",
    description_en: initialValues?.description_en ?? "",
    description_hi: initialValues?.description_hi ?? "",
  });

  async function handleSubmit() {
    if (!form.name_en.trim()) return;

    await onSubmit({
      name_en: form.name_en.trim(),
      name_hi: form.name_hi.trim(),
      description_en: form.description_en.trim(),
      description_hi: form.description_hi.trim(),
    });
    setForm({
      name_en: "",
      name_hi: "",
      description_en: "",
      description_hi: "",
    });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialValues ? `Edit ${entityName}` : `Create ${entityName}`}
      subtitle={`Manage details for your ${entityName.toLowerCase()}`}
      width="sm:max-w-[720px]"
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
            onClick={handleSubmit} 
            className="rounded-full bg-slate-900 px-8 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 hover:bg-slate-800 h-11 sm:h-10"
          >
            {initialValues ? "Save Changes" : `Create ${entityName}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 sm:space-y-8 py-2">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          <Field className="space-y-2 sm:space-y-2.5">
            <FieldLabel className="ml-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              English Name
            </FieldLabel>
            <Input
              placeholder="e.g. UPSC Prelims"
              value={form.name_en}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name_en: e.target.value,
                }))
              }
              className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 focus-visible:border-slate-400 focus-visible:ring-0 transition-all text-sm sm:text-base"
            />
          </Field>

          <Field className="space-y-2 sm:space-y-2.5">
            <FieldLabel className="ml-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Hindi Name
            </FieldLabel>
            <Input
              placeholder="e.g. यूपीएससी प्रारंभिक परीक्षा"
              value={form.name_hi}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name_hi: e.target.value,
                }))
              }
              className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 focus-visible:border-slate-400 focus-visible:ring-0 transition-all text-sm sm:text-base"
            />
          </Field>
        </div>

        <Field className="space-y-2 sm:space-y-2.5">
          <FieldLabel className="ml-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
            English Description
          </FieldLabel>
          <Input
            placeholder="Provide a detailed description in English..."
            value={form.description_en}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description_en: e.target.value,
              }))
            }
            className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 focus-visible:border-slate-400 focus-visible:ring-0 transition-all text-sm sm:text-base"
          />
        </Field>

        <Field className="space-y-2 sm:space-y-2.5">
          <FieldLabel className="ml-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
            Hindi Description
          </FieldLabel>
          <Input
            placeholder="विवरण हिंदी में प्रदान करें..."
            value={form.description_hi}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description_hi: e.target.value,
              }))
            }
            className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 px-4 focus-visible:border-slate-400 focus-visible:ring-0 transition-all text-sm sm:text-base"
          />
        </Field>
      </div>
    </Modal>
  );
}
