"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  createExam,
  deleteExam,
  getExams,
  updateExam,
} from "@/lib/syllabus/exams";

import { EntityFormModal } from "./entity-form-modal";

type Exam = {
  id: string;
  name_en: string;
  name_hi: string | null;
  slug: string;
  description_en: string | null;
  description_hi: string | null;
};

export function ExamsTab() {
  const [loading, setLoading] = useState(true);

  const [exams, setExams] = useState<Exam[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingExam, setEditingExam] =
    useState<Exam | null>(null);

  async function loadExams() {
    try {
      const data = await getExams();

      setExams((data ?? []) as Exam[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  async function handleCreateOrUpdate(
    values: {
      name_en: string;
      name_hi: string;
      description_en: string;
      description_hi: string;
    },
  ) {
    const slug = values.name_en
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (editingExam) {
      await updateExam(editingExam.id, {
        ...values,
        slug,
      });
    } else {
      await createExam({
        ...values,
        slug,
      });
    }

    setEditingExam(null);

    await loadExams();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this exam?",
    );

    if (!confirmed) return;

    await deleteExam(id);

    await loadExams();
  }

  return (
    <>
      <Card className="border-none bg-transparent shadow-none sm:bg-background/50 sm:backdrop-blur-sm sm:border sm:shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle className="text-xl font-bold text-slate-900">
            Exams ({exams.length})
          </CardTitle>

          <Button
            size="sm"
            onClick={() => {
              setEditingExam(null);
              setIsModalOpen(true);
            }}
            className="w-full rounded-full text-xs font-bold sm:w-auto"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Exam
          </Button>
        </CardHeader>

        <CardContent className="p-0 sm:p-0">
          {loading ? (
            <div className="p-10 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : exams.length === 0 ? (
            <div className="mx-6 my-6 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              No exams yet.
            </div>
          ) : (
            <div className="max-h-[450px] overflow-y-auto px-4 py-4 custom-scrollbar sm:max-h-[600px] sm:px-6 sm:py-6">
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between rounded-xl border bg-white/50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-slate-900">
                        {exam.name_en}
                      </div>

                      {exam.name_hi ? (
                        <div className="truncate text-xs font-medium text-slate-500">
                          {exam.name_hi}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                          setEditingExam(exam);
                          setIsModalOpen(true);
                        }}
                        className="h-8 w-8 rounded-full border-black/5 bg-white shadow-sm hover:scale-110"
                      >
                        <Pencil size={14} className="text-slate-600" />
                      </Button>

                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() =>
                          handleDelete(exam.id)
                        }
                        className="h-8 w-8 rounded-full shadow-sm hover:scale-110"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EntityFormModal
        key={editingExam?.id ?? "create"}
        entityName="Exam"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExam(null);
        }}
        initialValues={
          editingExam
            ? {
                name_en:
                  editingExam.name_en,
                name_hi:
                  editingExam.name_hi ??
                  "",
                description_en:
                  editingExam.description_en ??
                  "",
                description_hi:
                  editingExam.description_hi ??
                  "",
              }
            : undefined
        }
        onSubmit={handleCreateOrUpdate}
      />
    </>
  );
}