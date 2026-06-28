"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  createSubject,
  createSubjects,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "@/lib/syllabus/subjects";

import { EntityFormModal } from "./entity-form-modal";
import { BulkImportModal } from "./bulk-import-modal";
import { SyllabusImportModal } from "./syllabus-import-modal";
import {
  createOrGetMicroTopic,
  createTopic,
  createTopics,
  deleteTopic,
  getSubjectsWithSyllabusTree,
  updateTopic,
} from "@/lib/syllabus/topics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { linkSubjectTopic } from "@/lib/syllabus/mappings";
import { ConfirmationModal } from "../ui/modal/confirmation-modal";

type Subject = {
  id: string;
  name_en: string;
  name_hi: string | null;
  slug: string;
  description_en: string | null;
  description_hi: string | null;

  topics?: Topic[];
};

type MicroTopic = {
  id: string;
  name_en: string;
  name_hi?: string | null;
  slug: string;
};

type Topic = {
  id: string;
  name_en: string;
  name_hi?: string | null;
  slug: string;
  children?: MicroTopic[];
};

export function SubjectsTab() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [isMicroTopicModalOpen, setIsMicroTopicModalOpen] = useState(false);
  const [isBulkMicroTopicOpen, setIsBulkMicroTopicOpen] = useState(false);

  // const [editingTopic, setEditingTopic] = useState<{
  //   id: string;
  //   name_en: string;
  //   name_hi?: string | null;
  // } | null>(null);

  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [editingMicroTopic, setEditingMicroTopic] = useState<MicroTopic | null>(
    null,
  );

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isBulkTopicOpen, setIsBulkTopicOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<{
    id: string;
    name_en: string;
  } | null>(null);

  const [microTopicToDelete, setMicroTopicToDelete] = useState<{
    id: string;
    name_en: string;
  } | null>(null);

  async function loadSubjects() {
    try {
      const data = await getSubjectsWithSyllabusTree();

      setSubjects((data ?? []) as Subject[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  async function handleCreateOrUpdate(values: {
    name_en: string;
    name_hi: string;
    description_en: string;
    description_hi: string;
  }) {
    const slug = values.name_en.trim().toLowerCase().replace(/\s+/g, "-");

    if (editingSubject) {
      await updateSubject(editingSubject.id, {
        ...values,
        slug,
      });
    } else {
      await createSubject({
        ...values,
        slug,
      });
    }

    setEditingSubject(null);

    await loadSubjects();
  }

  console.log("subjects", subjects);
  return (
    <>
      <Card className="border-none bg-transparent shadow-none sm:bg-background/50 sm:backdrop-blur-sm sm:border sm:shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle className="text-xl font-bold text-slate-900">
            Subjects ({subjects.length})
          </CardTitle>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsBulkOpen(true)}
              className="flex-1 rounded-full text-xs font-bold sm:flex-none"
            >
              Bulk Import
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setEditingSubject(null);
                setIsModalOpen(true);
              }}
              className="flex-1 rounded-full text-xs font-bold sm:flex-none"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Subject
            </Button>
            <Button variant="secondary" onClick={() => setIsSyllabusOpen(true)}>
              Import Syllabus
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-0">
          {loading ? (
            <div className="p-10 text-sm text-muted-foreground">Loading...</div>
          ) : subjects.length === 0 ? (
            <div className="mx-6 my-6 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              No subjects yet.
            </div>
          ) : (
            <div className="max-h-[450px] overflow-y-auto px-4 py-4 custom-scrollbar sm:max-h-[600px] sm:px-6 sm:py-6">
              <div className="space-y-3">
                <Accordion type="multiple" className="space-y-3">
                  {subjects.map((subject) => (
                    <AccordionItem
                      key={subject.id}
                      value={subject.id}
                      className="rounded-2xl border bg-white px-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <AccordionTrigger className="flex-1 py-4 hover:no-underline">
                          <div className="text-left">
                            <div className="font-bold uppercase tracking-wide">
                              {subject.name_en}
                            </div>

                            {subject.name_hi && (
                              <div className="text-xs text-slate-500">
                                {subject.name_hi}
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                            {subject.topics?.length ?? 0} Topics
                          </span>

                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedSubject(subject);
                              setIsTopicModalOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubject(subject);
                              setIsBulkTopicOpen(true);
                            }}
                          >
                            Bulk Topics
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingSubject(subject);
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSubjectToDelete(subject)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <AccordionContent className="pb-5">
                        <div className="space-y-3">
                          <Accordion type="multiple" className="space-y-2">
                            {subject.topics?.map((topic) => (
                              <AccordionItem
                                key={topic.id}
                                value={topic.id}
                                className="rounded-xl border bg-slate-50 px-4"
                              >
                                <div className="flex items-start justify-between gap-4 py-3">
                                  <AccordionTrigger className="flex-1 hover:no-underline">
                                    <div className="text-left">
                                      <div className="font-semibold">
                                        {topic.name_en}
                                      </div>

                                      {topic.name_hi && (
                                        <div className="text-xs text-slate-500">
                                          {topic.name_hi}
                                        </div>
                                      )}
                                    </div>
                                  </AccordionTrigger>

                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTopic(topic);
                                        setIsMicroTopicModalOpen(true);
                                      }}
                                    >
                                      <Plus className="mr-1 h-3 w-3" />
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => {
                                        setSelectedTopic(topic);
                                        setIsBulkMicroTopicOpen(true);
                                      }}
                                    >
                                      Bulk Import
                                    </Button>

                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-7 w-7"
                                      onClick={() => setEditingTopic(topic)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>

                                    <Button
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        setTopicToDelete({
                                          id: topic.id,
                                          name_en: topic.name_en,
                                        })
                                      }
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                <AccordionContent>
                                  <div className="pt-2 space-y-3">
                                    {topic.children?.length ? (
                                      <div className="flex flex-wrap gap-2">
                                        {topic.children.map((child) => (
                                          <div
                                            key={child.id}
                                            className="flex items-center gap-1 rounded-full border bg-white px-3 py-1"
                                          >
                                            <span className="text-xs">
                                              {child.name_en}
                                            </span>

                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-5 w-5"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingMicroTopic(child);
                                              }}
                                            >
                                              <Pencil className="h-3 w-3 text-slate-500" />
                                            </Button>

                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-5 w-5"
                                              onClick={(e) => {
                                                e.stopPropagation();

                                                setMicroTopicToDelete({
                                                  id: child.id,
                                                  name_en: child.name_en,
                                                });
                                              }}
                                            >
                                              <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400">
                                        No micro topics yet.
                                      </p>
                                    )}
                                    {/* 
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedTopic(topic);
                                          setIsMicroTopicModalOpen(true);
                                        }}
                                      >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Micro Topic
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                          setSelectedTopic(topic);
                                          setIsBulkMicroTopicOpen(true);
                                        }}
                                      >
                                        Bulk Import
                                      </Button>
                                    </div> */}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EntityFormModal
        key={editingSubject?.id ?? "create"}
        entityName="Subject"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        initialValues={
          editingSubject
            ? {
                name_en: editingSubject.name_en,
                name_hi: editingSubject.name_hi ?? "",
                description_en: editingSubject.description_en ?? "",
                description_hi: editingSubject.description_hi ?? "",
              }
            : undefined
        }
        onSubmit={handleCreateOrUpdate}
      />
      <EntityFormModal
        entityName="Topic"
        isOpen={isTopicModalOpen}
        onClose={() => {
          setIsTopicModalOpen(false);
          setSelectedSubject(null);
        }}
        onSubmit={async (values) => {
          if (!selectedSubject) {
            return;
          }

          const slug = values.name_en
            .trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

          const topic = await createTopic({
            name_en: values.name_en,
            name_hi: values.name_hi,
            slug,
          });

          await linkSubjectTopic(selectedSubject.id, topic.id);

          await loadSubjects();

          setIsTopicModalOpen(false);
          setSelectedSubject(null);
        }}
      />

      <EntityFormModal
        entityName="Micro Topic"
        isOpen={isMicroTopicModalOpen}
        onClose={() => {
          setIsMicroTopicModalOpen(false);
          setSelectedTopic(null);
        }}
        onSubmit={async (values) => {
          if (!selectedTopic) {
            return;
          }

          const topic = await createOrGetMicroTopic(
            selectedTopic.id,
            values.name_en,
          );

          if (values.name_hi) {
            await updateTopic(topic.id, {
              name_hi: values.name_hi,
            });
          }

          await loadSubjects();

          setIsMicroTopicModalOpen(false);
          setSelectedTopic(null);
        }}
      />
      <EntityFormModal
        key={editingTopic?.id ?? "edit-topic"}
        entityName="Topic"
        isOpen={!!editingTopic}
        onClose={() => setEditingTopic(null)}
        initialValues={
          editingTopic
            ? {
                name_en: editingTopic.name_en,
                name_hi: editingTopic.name_hi ?? "",
                description_en: "",
                description_hi: "",
              }
            : undefined
        }
        onSubmit={async (values) => {
          if (!editingTopic) {
            return;
          }

          await updateTopic(editingTopic.id, {
            name_en: values.name_en,
            name_hi: values.name_hi,
          });

          await loadSubjects();

          setEditingTopic(null);
        }}
      />
      <EntityFormModal
        key={editingMicroTopic?.id ?? "edit-micro-topic"}
        entityName="Micro Topic"
        isOpen={!!editingMicroTopic}
        onClose={() => setEditingMicroTopic(null)}
        initialValues={
          editingMicroTopic
            ? {
                name_en: editingMicroTopic.name_en,
                name_hi: editingMicroTopic.name_hi ?? "",
                description_en: "",
                description_hi: "",
              }
            : undefined
        }
        onSubmit={async (values) => {
          if (!editingMicroTopic) {
            return;
          }

          await updateTopic(editingMicroTopic.id, {
            name_en: values.name_en,
            name_hi: values.name_hi,
          });

          await loadSubjects();

          setEditingMicroTopic(null);
        }}
      />
      <BulkImportModal
        entityName="Micro Topics"
        isOpen={isBulkMicroTopicOpen}
        onClose={() => {
          setIsBulkMicroTopicOpen(false);
          setSelectedTopic(null);
        }}
        onImport={async (rows) => {
          if (!selectedTopic) {
            return;
          }

          for (const row of rows) {
            const topic = await createOrGetMicroTopic(
              selectedTopic.id,
              row.name_en,
            );

            if (row.name_hi) {
              await updateTopic(topic.id, {
                name_hi: row.name_hi,
              });
            }
          }

          await loadSubjects();

          setIsBulkMicroTopicOpen(false);
          setSelectedTopic(null);
        }}
      />
      <BulkImportModal
        entityName="Subjects"
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onImport={async (rows) => {
          await createSubjects(
            rows.map((row) => ({
              ...row,
              slug: row.name_en
                .trim()
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-"),
            })),
          );

          await loadSubjects();
        }}
      />
      <BulkImportModal
        entityName="Topics"
        isOpen={isBulkTopicOpen}
        onClose={() => {
          setIsBulkTopicOpen(false);
          setSelectedSubject(null);
        }}
        onImport={async (rows) => {
          if (!selectedSubject) {
            return;
          }

          const topics = await createTopics(
            rows.map((row) => ({
              name_en: row.name_en,
              name_hi: row.name_hi,
              slug: row.name_en
                .trim()
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-"),
            })),
          );

          await Promise.all(
            topics.map((topic) =>
              linkSubjectTopic(selectedSubject.id, topic.id),
            ),
          );

          await loadSubjects();

          setIsBulkTopicOpen(false);
          setSelectedSubject(null);
        }}
      />
      <SyllabusImportModal
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
        onSuccess={loadSubjects}
      />
      <ConfirmationModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={async () => {
          if (!subjectToDelete) {
            return;
          }

          await deleteSubject(subjectToDelete.id);

          setSubjectToDelete(null);

          await loadSubjects();
        }}
        title="Delete Subject?"
        description={`Delete "${subjectToDelete?.name_en}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationModal
        isOpen={!!topicToDelete}
        onClose={() => setTopicToDelete(null)}
        onConfirm={async () => {
          if (!topicToDelete) {
            return;
          }

          await deleteTopic(topicToDelete.id);

          setTopicToDelete(null);

          await loadSubjects();
        }}
        title="Delete Topic?"
        description={`Delete "${topicToDelete?.name_en}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationModal
        isOpen={!!microTopicToDelete}
        onClose={() => setMicroTopicToDelete(null)}
        onConfirm={async () => {
          if (!microTopicToDelete) {
            return;
          }

          await deleteTopic(microTopicToDelete.id);

          setMicroTopicToDelete(null);

          await loadSubjects();
        }}
        title="Delete Micro Topic?"
        description={`Delete "${microTopicToDelete?.name_en}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
