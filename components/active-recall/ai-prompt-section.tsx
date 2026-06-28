"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RECALL_PROFILES } from "@/lib/active-recall/recall-profiles";

type SyllabusItem = {
  id: string;
  name_en: string;
  name_hi?: string | null;
};

type AiPromptSectionProps = {
  subjects: SyllabusItem[];
  topics: SyllabusItem[];
  subtopics: SyllabusItem[];

  selectedSubject: SyllabusItem | null;
  selectedTopic: SyllabusItem | null;
  selectedSubtopic: SyllabusItem | null;

  questionCount: number;
  generatedPrompt: string;
  copyState: "idle" | "copied";

  onSubjectChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onSubtopicChange: (value: string) => void;

  onQuestionCountChange: (value: number) => void;
  onGeneratePrompt: () => void;
  onCopyPrompt: () => void;
  microTopic: string;

  onMicroTopicChange: (value: string) => void;
  isCustomMicroTopic: boolean;
  onCustomMicroTopicChange: (value: boolean) => void;
  sheetTitle: string;
  onSheetTitleChange: (value: string) => void;
  recallProfile: string;

  customInstruction: string;

  onRecallProfileChange: (value: string) => void;

  onCustomInstructionChange: (value: string) => void;
};

export function AiPromptSection({
  subjects,
  topics,
  subtopics,

  selectedSubject,
  selectedTopic,
  selectedSubtopic,

  questionCount,
  generatedPrompt,
  copyState,

  onSubjectChange,
  onTopicChange,
  onSubtopicChange,

  onQuestionCountChange,
  onGeneratePrompt,
  onCopyPrompt,
  microTopic,
  onMicroTopicChange,
  isCustomMicroTopic,
  onCustomMicroTopicChange,
  sheetTitle,
  onSheetTitleChange,
  recallProfile,
  customInstruction,
  onRecallProfileChange,
  onCustomInstructionChange,
}: AiPromptSectionProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Step 1
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              Recall Setup
            </h3>
          </div>
          <span className="rounded-full bg-[#1f3a2f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-50">
            AI Mode
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Subject
            </span>

            <Select value={selectedSubject?.id} onValueChange={onSubjectChange}>
              <SelectTrigger className="h-12 rounded-[20px]">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>

              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Topic
            </span>

            <Select
              value={selectedTopic?.id}
              onValueChange={onTopicChange}
              disabled={!selectedSubject}
            >
              <SelectTrigger className="h-12 rounded-[20px]">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>

              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          {/* {subtopics.length > 0 && (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Subtopic
              </span>

              <Select
                value={selectedSubtopic?.id}
                onValueChange={onSubtopicChange}
              >
                <SelectTrigger className="h-12 rounded-[20px]">
                  <SelectValue placeholder="Select Subtopic" />
                </SelectTrigger>

                <SelectContent>
                  {subtopics.map((subtopic) => (
                    <SelectItem key={subtopic.id} value={subtopic.id}>
                      {subtopic.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )} */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Micro Topic
            </span>

            <Select
              value={isCustomMicroTopic ? "__custom__" : selectedSubtopic?.id}
              onValueChange={(value) => {
                if (value === "__custom__") {
                  onCustomMicroTopicChange(true);
                  return;
                }

                onCustomMicroTopicChange(false);
                onSubtopicChange(value);
              }}
            >
              <SelectTrigger className="h-12 rounded-[20px]">
                <SelectValue placeholder="Select or Create Micro Topic" />
              </SelectTrigger>

              <SelectContent>
                {subtopics.map((subtopic) => (
                  <SelectItem key={subtopic.id} value={subtopic.id}>
                    {subtopic.name_en}
                  </SelectItem>
                ))}

                <SelectItem value="__custom__">
                  + Create New Micro Topic
                </SelectItem>
              </SelectContent>
            </Select>
          </label>
          {isCustomMicroTopic && (
            <Input
              value={microTopic}
              onChange={(e) => onMicroTopicChange(e.target.value)}
              placeholder="Enter new micro topic"
              className="h-12 rounded-[20px]"
            />
          )}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Generation Style
            </span>

            <Select value={recallProfile} onValueChange={onRecallProfileChange}>
              <SelectTrigger className="h-12 rounded-[20px]">
                <SelectValue placeholder="Select Generation Style" />
              </SelectTrigger>

              <SelectContent>
                {RECALL_PROFILES.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Sheet Title
            </span>
            <Input
              value={sheetTitle}
              onChange={(e) => onSheetTitleChange(e.target.value)}
              placeholder="e.g. Parliament Revision"
              className="h-12 rounded-[20px]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Additional Instructions
              <span className="ml-2 text-[10px] font-normal text-slate-400">
                (Optional)
              </span>
            </span>

            <Textarea
              value={customInstruction}
              onChange={(e) => onCustomInstructionChange(e.target.value)}
              placeholder={`Examples:

• Focus on constitutional articles
• Generate statement-based recall
• Include previous year themes
• Avoid factual trivia
• Use tables wherever suitable`}
              className="min-h-28 rounded-[20px]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Number of Recall Cards
            </span>
            <Input
              type="number"
              min={1}
              max={80}
              value={questionCount}
              onChange={(e) => onQuestionCountChange(Number(e.target.value))}
              className="h-12 rounded-[20px]"
            />
          </label>

          <Button
            onClick={onGeneratePrompt}
            disabled={!selectedSubject || !selectedTopic}
            className="h-12 rounded-[20px] bg-[#1f3a2f]"
          >
            Generate Active Recall
          </Button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Step 2
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              AI Prompt Box
            </h3>
          </div>
          <Button
            variant="outline"
            onClick={onCopyPrompt}
            disabled={!generatedPrompt}
            className="rounded-[18px]"
          >
            {copyState === "copied" ? "Copied" : "Copy Prompt"}
          </Button>
        </div>

        <Textarea
          value={generatedPrompt}
          readOnly
          placeholder="Your dynamic Active Recall AI prompt appears here after generation."
          className="mt-5 min-h-[280px] rounded-[22px] bg-[#f8f5ee] font-mono text-[13px]"
        />
      </section>
    </div>
  );
}
