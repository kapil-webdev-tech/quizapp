"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getExams } from "@/lib/syllabus/exams";

import {
  getExamHierarchy,
  type ExplorerSubject,
} from "@/lib/syllabus/explorer";
import { Modal } from "../ui/modal/modal";

type Exam = {
  id: string;
  name_en: string;
};

export function ExplorerTab() {
  const [exams, setExams] = useState<Exam[]>([]);

  const [selectedExam, setSelectedExam] = useState("");

  const [subjects, setSubjects] = useState<ExplorerSubject[]>([]);
  const [selectedSubject, setSelectedSubject] =
    useState<ExplorerSubject | null>(null);

  const topics = selectedSubject?.topics ?? [];

  const midpoint = Math.ceil(topics.length / 2);

  const leftTopics = topics.slice(0, midpoint);

  const rightTopics = topics.slice(midpoint);
  useEffect(() => {
    async function load() {
      const data = await getExams();

      setExams(
        (data ?? []).map((exam) => ({
          id: exam.id,
          name_en: exam.name_en,
        })),
      );
    }

    load();
  }, []);

  useEffect(() => {
    async function loadHierarchy() {
      if (!selectedExam) {
        setSubjects([]);
        return;
      }

      const data = await getExamHierarchy(selectedExam);

      setSubjects(data);
    }

    loadHierarchy();
  }, [selectedExam]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Syllabus Explorer</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <select
          className="w-full rounded-md border p-2"
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="">Select Exam</option>

          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name_en}
            </option>
          ))}
        </select>

        {!selectedExam && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Select an exam
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="h-fit border bg-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{subject.name_en}</CardTitle>

                <p className="text-xs text-muted-foreground">
                  {subject.topics.length} Topics
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {subject.topics.slice(0, 8).map((topic) => (
                    <span
                      key={topic.id}
                      className="rounded-full border px-2 py-1 text-xs"
                    >
                      {topic.name_en}
                    </span>
                  ))}

                  {subject.topics.length > 8 && (
                    <button
                      type="button"
                      className="rounded-full border px-2 py-1 text-xs text-primary hover:bg-muted"
                      onClick={() => setSelectedSubject(subject)}
                    >
                      +{subject.topics.length - 8} more
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <Modal
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSubject(null)}
        title={selectedSubject?.name_en ?? ""}
        subtitle={`${selectedSubject?.topics.length ?? 0} Topics`}
      >
        <div className="max-h-[500px] overflow-y-auto">
          {selectedSubject && (
            <div className="grid grid-cols-2 gap-x-10">
              <div className="space-y-2">
                {leftTopics?.map((topic, index) => (
                  <div key={topic.id} className="flex gap-2 text-sm">
                    <span className="w-8 text-muted-foreground">
                      {index + 1}.
                    </span>

                    <span>{topic.name_en}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {rightTopics?.map((topic, index) => (
                  <div key={topic.id} className="flex gap-2 text-sm">
                    <span className="w-8 text-muted-foreground">
                      {midpoint + index + 1}.
                    </span>

                    <span>{topic.name_en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
}
