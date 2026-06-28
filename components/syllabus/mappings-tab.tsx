"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { getExams } from "@/lib/syllabus/exams";
import { getSubjects } from "@/lib/syllabus/subjects";
import { getTopics } from "@/lib/syllabus/topics";

import {
  getExamSubjects,
  getExamSubjectTopics,
  getSubjectTopics,
  getTopicRelations,
  getTopicsForSubject,
  linkTopicRelation,
  saveExamSubjects,
  saveExamSubjectTopics,
  saveSubjectTopics,
  unlinkTopicRelation,
} from "@/lib/syllabus/mappings";

import { toast } from "sonner";
import { SearchInput } from "../ui/search-input";
import { Loader } from "../ui/loader";

type Exam = {
  id: string;
  name_en: string;
};

type Subject = {
  id: string;
  name_en: string;
};

type Topic = {
  id: string;
  name_en: string;
};

export function MappingsTab() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedExam, setSelectedExam] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");

  const [selectedExamSubjects, setSelectedExamSubjects] = useState<string[]>(
    [],
  );

  const [selectedSubjectTopics, setSelectedSubjectTopics] = useState<string[]>(
    [],
  );
  const [subjectSearch, setSubjectSearch] = useState("");

  const [topicSearch, setTopicSearch] = useState("");

  const filteredSubjects = subjects.filter((subject) =>
    subject.name_en.toLowerCase().includes(subjectSearch.toLowerCase()),
  );

  const filteredTopics = topics.filter((topic) =>
    topic.name_en.toLowerCase().includes(topicSearch.toLowerCase()),
  );

  const selectedTopics = filteredTopics.filter((topic) =>
    selectedSubjectTopics.includes(topic.id),
  );

  const unselectedTopics = filteredTopics.filter(
    (topic) => !selectedSubjectTopics.includes(topic.id),
  );
  const [isLoadingExamMappings, setIsLoadingExamMappings] = useState(false);

  const [isLoadingSubjectMappings, setIsLoadingSubjectMappings] =
    useState(false);

  const [selectedExamForTopics, setSelectedExamForTopics] = useState("");
  const [selectedSubjectForTopics, setSelectedSubjectForTopics] = useState("");
  const [examTopicIds, setExamTopicIds] = useState<string[]>([]);
  const [subjectTopicsForExam, setSubjectTopicsForExam] = useState<
    { id: string; name_en: string }[]
  >([]);

  const [parentTopicId, setParentTopicId] = useState("");

  const [childTopicId, setChildTopicId] = useState("");

  const [topicRelations, setTopicRelations] = useState<any[]>([]);

  useEffect(() => {
    async function loadRelations() {
      if (!parentTopicId) {
        setTopicRelations([]);
        return;
      }

      const data = await getTopicRelations(parentTopicId);

      setTopicRelations(data);
    }

    loadRelations();
  }, [parentTopicId]);

  useEffect(() => {
    async function loadExamTopicMappings() {
      if (!selectedExamForTopics || !selectedSubjectForTopics) {
        setExamTopicIds([]);
        setSubjectTopicsForExam([]);
        return;
      }

      const [examTopics, subjectTopics] = await Promise.all([
        getExamSubjectTopics(selectedExamForTopics, selectedSubjectForTopics),
        getTopicsForSubject(selectedSubjectForTopics),
      ]);

      setExamTopicIds(examTopics.map((row) => row.topic_id));

      setSubjectTopicsForExam(subjectTopics);
    }

    loadExamTopicMappings();
  }, [selectedExamForTopics, selectedSubjectForTopics]);

  useEffect(() => {
    async function load() {
      const [examsData, subjectsData, topicsData] = await Promise.all([
        getExams(),
        getSubjects(),
        getTopics(),
      ]);

      setExams(
        [...(examsData ?? [])].sort((a, b) =>
          a.name_en.localeCompare(b.name_en),
        ),
      );

      setSubjects(
        [...(subjectsData ?? [])].sort((a, b) =>
          a.name_en.localeCompare(b.name_en),
        ),
      );

      setTopics(
        [...(topicsData ?? [])].sort((a, b) =>
          a.name_en.localeCompare(b.name_en),
        ),
      );
    }

    load();
  }, []);

  useEffect(() => {
    async function loadSubjectMappings() {
      if (!selectedSubject) {
        setSelectedSubjectTopics([]);
        return;
      }

      try {
        setIsLoadingSubjectMappings(true);

        const data = await getSubjectTopics(selectedSubject);

        setSelectedSubjectTopics(data.map((row) => row.topic_id));
        setIsLoadingSubjectMappings(false);
      } finally {
        setIsLoadingSubjectMappings(false);
      }
    }

    loadSubjectMappings();
  }, [selectedSubject]);

  useEffect(() => {
    async function loadExamMappings() {
      if (!selectedExam) {
        setSelectedExamSubjects([]);
        return;
      }

      try {
        setIsLoadingExamMappings(true);

        const data = await getExamSubjects(selectedExam);

        setSelectedExamSubjects(data.map((row) => row.subject_id));
        setIsLoadingSubjectMappings(false);
      } finally {
        setIsLoadingExamMappings(false);
      }
    }

    loadExamMappings();
  }, [selectedExam]);

  function toggleSubject(subjectId: string) {
    setSelectedExamSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  }

  function toggleTopic(topicId: string) {
    setSelectedSubjectTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  }
  console.log("exams", exams, subjectTopicsForExam);

  function toggleExamTopic(topicId: string) {
    setExamTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  }

  useEffect(() => {
    setTopicSearch("");
  }, [selectedSubject]);
  return (
    <div className="space-y-6">
      {/* Subject → Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Build Subject Syllabus</CardTitle>{" "}
        </CardHeader>

        <CardContent className="space-y-4">
          <select
            className="w-full rounded-md border p-2"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name_en}
              </option>
            ))}
          </select>

          <SearchInput
            value={topicSearch}
            onChange={setTopicSearch}
            placeholder="Search topics..."
          />

          <div className="max-h-96 overflow-y-auto rounded-md border p-3">
            {isLoadingSubjectMappings ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Loader message="loading topics..." />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-4">
                  {selectedTopics.length > 0 && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-green-600">
                        Selected Topics ({selectedTopics.length})
                      </div>

                      <div className="space-y-2">
                        {selectedTopics.map((topic) => (
                          <label
                            key={topic.id}
                            className="flex items-center gap-2 rounded bg-green-50 p-2"
                          >
                            <input
                              type="checkbox"
                              checked
                              onChange={() => toggleTopic(topic.id)}
                            />

                            {topic.name_en}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {unselectedTopics.length > 0 && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-muted-foreground">
                        Available Topics ({unselectedTopics.length})
                      </div>

                      <div className="space-y-2">
                        {unselectedTopics.map((topic) => (
                          <label
                            key={topic.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => toggleTopic(topic.id)}
                            />

                            {topic.name_en}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            disabled={!selectedSubject}
            onClick={async () => {
              await saveSubjectTopics(selectedSubject, selectedSubjectTopics);

              toast.success("Topics saved");
            }}
          >
            Save Topics
          </Button>
        </CardContent>
      </Card>
      {/* Exam → Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Assign Subjects To Exam</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
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

          <SearchInput
            value={subjectSearch}
            onChange={setSubjectSearch}
            placeholder="Search subjects..."
          />

          <div className="max-h-96 overflow-y-auto rounded-md border p-3">
            {isLoadingExamMappings ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Loader message="loading subjects..." />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSubjects.map((subject) => (
                  <label key={subject.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedExamSubjects.includes(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                    />

                    {subject.name_en}
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button
            disabled={!selectedExam || isLoadingExamMappings}
            onClick={async () => {
              await saveExamSubjects(selectedExam, selectedExamSubjects);

              toast.success("Subjects saved");
            }}
          >
            Save Subjects
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Exam Specific Topics</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <select
            className="w-full rounded-md border p-2"
            value={selectedExamForTopics}
            onChange={(e) => setSelectedExamForTopics(e.target.value)}
          >
            <option value="">Select Exam</option>

            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name_en}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-md border p-2"
            value={selectedSubjectForTopics}
            onChange={(e) => setSelectedSubjectForTopics(e.target.value)}
          >
            <option value="">Select Subject</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name_en}
              </option>
            ))}
          </select>

          <div className="max-h-96 overflow-y-auto rounded-md border p-3">
            <div className="space-y-2">
              {subjectTopicsForExam.map((topic) => (
                <label key={topic.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={examTopicIds.includes(topic.id)}
                    onChange={() => toggleExamTopic(topic.id)}
                  />

                  {topic.name_en}
                </label>
              ))}
            </div>
          </div>

          <Button
            disabled={!selectedExamForTopics || !selectedSubjectForTopics}
            onClick={async () => {
              await saveExamSubjectTopics(
                selectedExamForTopics,
                selectedSubjectForTopics,
                examTopicIds,
              );

              toast.success("Exam topics saved");
            }}
          >
            Save Exam Topics
          </Button>
        </CardContent>
      </Card>

      {/* Card 4 Sub-topic relations */}

      <Card>
        <CardHeader>
          <CardTitle>Step 4: Topic Relations</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <select
            className="w-full rounded-md border p-2"
            value={parentTopicId}
            onChange={(e) => setParentTopicId(e.target.value)}
          >
            <option value="">Select Parent Topic</option>

            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name_en}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-md border p-2"
            value={childTopicId}
            onChange={(e) => setChildTopicId(e.target.value)}
          >
            <option value="">Select Child Topic</option>

            {topics
              .filter((topic) => topic.id !== parentTopicId)
              .map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name_en}
                </option>
              ))}
          </select>

          <Button
            disabled={!parentTopicId || !childTopicId}
            onClick={async () => {
              await linkTopicRelation(parentTopicId, childTopicId, "contains");

              const data = await getTopicRelations(parentTopicId);

              setTopicRelations(data);

              setChildTopicId("");

              toast.success("Relation added");
            }}
          >
            Add Relation
          </Button>

          <div className="rounded-md border p-3">
            <div className="mb-2 text-sm font-semibold">Current Children</div>

            <div className="space-y-2">
              {topicRelations.map((relation) => (
                <div
                  key={relation.child_topic_id}
                  className="flex items-center justify-between"
                >
                  <span>{relation.topics?.name_en}</span>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      await unlinkTopicRelation(
                        parentTopicId,
                        relation.child_topic_id,
                      );

                      const data = await getTopicRelations(parentTopicId);

                      setTopicRelations(data);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
