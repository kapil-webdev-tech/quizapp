"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BulkImportModal } from "./bulk-import-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  createTopic,
  createTopics,
  deleteAllTopics,
  deleteTopic,
  deleteTopics,
  getTopics,
  updateTopic,
} from "@/lib/syllabus/topics";

import { EntityFormModal } from "./entity-form-modal";
import { ConfirmationModal } from "../ui/modal/confirmation-modal";

type Topic = {
  id: string;
  name_en: string;
  name_hi: string | null;
  slug: string;
  description_en: string | null;
  description_hi: string | null;
};

export function TopicsTab() {
  const [loading, setLoading] = useState(true);

  const [topics, setTopics] = useState<Topic[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  function toggleSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  async function loadTopics() {
    try {
      const data = await getTopics();

      setTopics((data ?? []) as Topic[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  async function handleCreateOrUpdate(values: {
    name_en: string;
    name_hi: string;
    description_en: string;
    description_hi: string;
  }) {
    const slug = values.name_en.trim().toLowerCase().replace(/\s+/g, "-");

    if (editingTopic) {
      await updateTopic(editingTopic.id, {
        ...values,
        slug,
      });
    } else {
      await createTopic({
        ...values,
        slug,
      });
    }

    setEditingTopic(null);

    await loadTopics();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this topic?");

    if (!confirmed) return;

    await deleteTopic(id);

    await loadTopics();
  }
  async function handleDeleteSelected() {
    await deleteTopics(selectedIds);

    setSelectedIds([]);

    setDeleteSelectedOpen(false);

    await loadTopics();
  }

  async function handleDeleteAll() {
    await deleteAllTopics();

    setSelectedIds([]);

    setDeleteAllOpen(false);

    await loadTopics();
  }

  return (
    <>
      <Card className="border-none bg-transparent shadow-none sm:bg-background/50 sm:backdrop-blur-sm sm:border sm:shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle className="text-xl font-bold text-slate-900">
            Topics ({topics.length})
          </CardTitle>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {selectedIds.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteSelectedOpen(true)}
                className="flex-1 rounded-full text-xs font-bold sm:flex-none"
              >
                Delete ({selectedIds.length})
              </Button>
            )}

            {topics.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteAllOpen(true)}
                className="flex-1 rounded-full text-xs font-bold sm:flex-none"
              >
                Delete All
              </Button>
            )}

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
                setEditingTopic(null);
                setIsModalOpen(true);
              }}
              className="flex-1 rounded-full text-xs font-bold sm:flex-none"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Topic
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-0">
          {loading ? (
            <div className="p-10 text-sm text-muted-foreground">Loading...</div>
          ) : topics.length === 0 ? (
            <div className="mx-6 my-6 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              No topics yet.
            </div>
          ) : (
            <div className="max-h-[450px] overflow-y-auto px-4 py-4 custom-scrollbar sm:max-h-[600px] sm:px-6 sm:py-6">
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between rounded-xl border bg-white/50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="mt-1 flex shrink-0 items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(topic.id)}
                          onChange={() => toggleSelection(topic.id)}
                          className="h-4 w-4 rounded-md border-slate-300 transition-all accent-slate-900 cursor-pointer"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-slate-900 leading-tight">
                          {topic.name_en}
                        </div>

                        {topic.name_hi ? (
                          <div className="mt-0.5 truncate text-xs font-medium text-slate-500">
                            {topic.name_hi}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                          setEditingTopic(topic);
                          setIsModalOpen(true);
                        }}
                        className="h-8 w-8 rounded-full border-black/5 bg-white shadow-sm hover:scale-110"
                      >
                        <Pencil size={14} className="text-slate-600" />
                      </Button>

                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() => setTopicToDelete(topic)}
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
        key={editingTopic?.id ?? "create"}
        entityName="Topic"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTopic(null);
        }}
        initialValues={
          editingTopic
            ? {
                name_en: editingTopic.name_en,
                name_hi: editingTopic.name_hi ?? "",
                description_en: editingTopic.description_en ?? "",
                description_hi: editingTopic.description_hi ?? "",
              }
            : undefined
        }
        onSubmit={handleCreateOrUpdate}
      />
      <BulkImportModal
        entityName="Topics"
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onImport={async (rows) => {
          await createTopics(
            rows.map((row) => ({
              ...row,
              slug: row.name_en.trim().toLowerCase().replace(/\s+/g, "-"),
            })),
          );

          await loadTopics();
        }}
      />
      <ConfirmationModal
        isOpen={deleteSelectedOpen}
        onClose={() => setDeleteSelectedOpen(false)}
        onConfirm={() => void handleDeleteSelected()}
        title="Delete Selected Topics?"
        description={`This will permanently delete ${selectedIds.length} topics.`}
        confirmLabel="Delete Selected"
        cancelLabel="Cancel"
      />

      <ConfirmationModal
        isOpen={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        onConfirm={() => void handleDeleteAll()}
        title="Delete All Topics?"
        description="This will permanently delete all topics. This action cannot be undone."
        confirmLabel="Delete All"
        cancelLabel="Cancel"
      />

      <ConfirmationModal
        isOpen={!!topicToDelete}
        onClose={() => setTopicToDelete(null)}
        onConfirm={async () => {
          if (!topicToDelete) return;

          await deleteTopic(topicToDelete.id);

          setTopicToDelete(null);

          await loadTopics();
        }}
        title="Delete Topic?"
        description={`Delete "${topicToDelete?.name_en}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
