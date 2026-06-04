"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { ArrowRight, X } from "react-feather";
import { MicIcon } from "lucide-react";
import SparkIcon, { PlusIcon } from "@/components/ui/icon";
import { AttachmentList } from "@/components/studio/upload/attachment-list";
import { SourcePreviewPanel } from "@/components/studio/upload/source-preview-panel";
import { generationModes } from "@/lib/custom-quiz-store";
import type {
  StudioAttachmentDraft,
  StudioProvider,
  StudioSourcePreview,
} from "@/features/studio/shared/types";
import { aiModeLabels, providerMeta } from "./utils/ai-studio-config";
import { AiModelSelector } from "./ai-model-selector";

type AiPromptEditorProps = {
  provider: StudioProvider;
  providerMenuOpen: boolean;
  toolsPanelOpen: boolean;
  userPrompt: string;
  selectedModes: string[];
  currentProviderKey: string;
  showKey: boolean;
  promptCopyState: "idle" | "copied";
  previewCopyState: "idle" | "copied";
  isGenerating: boolean;
  isPreviewingSource: boolean;
  attachments: StudioAttachmentDraft[];
  sourcePreview: StudioSourcePreview | null;
  sourcePreviewMinimized: boolean;
  onPromptChange: (value: string) => void;
  onPromptKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onAttachmentSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (id: string) => void;
  onToggleTools: () => void;
  onCopyPrompt: () => void;
  onPreviewSource: () => void;
  onToggleProviderMenu: () => void;
  onSelectProvider: (provider: StudioProvider) => void;
  onGenerate: () => void;
  onToggleMode: (mode: string) => void;
  onProviderKeyChange: (value: string) => void;
  onToggleShowKey: () => void;
  onClearCurrentKey: () => void;
  onCopySourcePreview: () => void;
  onToggleSourcePreview: () => void;
  onClearSourcePreview: () => void;
};

export function AiPromptEditor({
  provider,
  providerMenuOpen,
  toolsPanelOpen,
  userPrompt,
  selectedModes,
  currentProviderKey,
  showKey,
  promptCopyState,
  previewCopyState,
  isGenerating,
  isPreviewingSource,
  attachments,
  sourcePreview,
  sourcePreviewMinimized,
  onPromptChange,
  onPromptKeyDown,
  onAttachmentSelect,
  onRemoveAttachment,
  onToggleTools,
  onCopyPrompt,
  onPreviewSource,
  onToggleProviderMenu,
  onSelectProvider,
  onGenerate,
  onToggleMode,
  onProviderKeyChange,
  onToggleShowKey,
  onClearCurrentKey,
  onCopySourcePreview,
  onToggleSourcePreview,
  onClearSourcePreview,
}: AiPromptEditorProps) {
  const currentMeta = providerMeta[provider];

  return (
    <div className="relative overflow-hidden rounded-[36px] bg-[#050505] px-4 py-6 text-white shadow-[0_40px_140px_rgba(0,0,0,0.38)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_28%),radial-gradient(circle_at_15%_25%,_rgba(0,180,255,0.08),_transparent_22%),radial-gradient(circle_at_80%_15%,_rgba(255,120,120,0.08),_transparent_24%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xl font-semibold text-white/92">Gemini Studio</p>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
              UPSC
            </span>
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
              Quiz Builder
            </span>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-cyan-300">
              <SparkIcon />
            </span>
            <p className="text-2xl font-semibold text-white/90">Hi Aspirant</p>
          </div>
          <h3 className="mt-2 text-4xl font-medium text-white sm:text-5xl">
            Where should we start?
          </h3>

          <div className="relative mt-8 rounded-[32px] border border-white/10 bg-[#222223] px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <textarea
              value={userPrompt}
              onChange={(event) => onPromptChange(event.target.value)}
              onKeyDown={onPromptKeyDown}
              rows={4}
              placeholder="Ask Gemini to create a UPSC prelims drill..."
              className="w-full resize-none border-0 bg-transparent p-0 text-lg leading-8 text-white outline-none placeholder:text-white/38"
            />

            <AttachmentList
              attachments={attachments}
              variant="dark"
              onRemove={onRemoveAttachment}
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-white/68 transition hover:bg-white/8 hover:text-white">
                  <input
                    type="file"
                    accept="image/*,application/pdf,text/plain,.txt"
                    multiple
                    className="hidden"
                    onChange={onAttachmentSelect}
                  />
                  <PlusIcon />
                </label>
                <button
                  type="button"
                  onClick={onToggleTools}
                  className="rounded-full px-3 py-2 text-sm font-medium text-white/68 transition hover:bg-white/8 hover:text-white"
                >
                  Tools
                </button>
                <button
                  type="button"
                  onClick={onCopyPrompt}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    promptCopyState === "copied"
                      ? "bg-emerald-500/18 text-emerald-200"
                      : "text-white/68 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {promptCopyState === "copied" ? "Copied" : "Copy Prompt"}
                </button>
                <button
                  type="button"
                  onClick={onPreviewSource}
                  disabled={isPreviewingSource}
                  className="rounded-full px-3 py-2 text-sm font-medium text-white/68 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPreviewingSource ? "Previewing..." : "Preview Extract"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <AiModelSelector
                  provider={provider}
                  open={providerMenuOpen}
                  onToggle={onToggleProviderMenu}
                  onSelect={onSelectProvider}
                />
                <button
                  type="button"
                  className="rounded-full px-2 py-2 text-white/72 transition hover:bg-white/8 hover:text-white"
                  aria-label="Voice input"
                >
                  <MicIcon />
                </button>
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-950 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={isGenerating ? "Generating draft" : "Generate draft"}
                >
                  {isGenerating ? "..." : <ArrowRight />}
                </button>
              </div>
            </div>
          </div>

          <SourcePreviewPanel
            sourcePreview={sourcePreview}
            variant="dark"
            minimized={sourcePreviewMinimized}
            copyState={previewCopyState}
            onCopy={onCopySourcePreview}
            onToggleMinimized={onToggleSourcePreview}
            onClear={onClearSourcePreview}
          />
        </div>

        {toolsPanelOpen ? (
          <div className="popup-surface popup-scroll absolute right-0 top-16 z-20 max-h-[min(36rem,calc(100vh-7rem))] w-full max-w-[336px] overflow-y-auto rounded-[24px] border border-white/10 bg-[#202126]/98 p-3.5 shadow-[0_32px_100px_rgba(0,0,0,0.48)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-white/92">Tools</p>
              <button
                type="button"
                onClick={onToggleTools}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/58 transition hover:bg-white/8 hover:text-white"
              >
                <X />
              </button>
            </div>
            <div className="mt-3.5 space-y-3">
              <div className="rounded-[18px] border border-white/[0.05] bg-white/[0.04] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
                  Question Types
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {generationModes.map((modeValue) => (
                    <button
                      key={modeValue}
                      type="button"
                      onClick={() => onToggleMode(modeValue)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                        selectedModes.includes(modeValue)
                          ? "bg-white text-slate-950"
                          : "bg-white/10 text-white/76 hover:bg-white/14"
                      }`}
                    >
                      {aiModeLabels[modeValue]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[18px] border border-white/[0.05] bg-white/[0.04] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
                  {currentMeta.keyLabel}
                </p>
                <div className="mt-2.5 flex gap-2">
                  <input
                    type={showKey ? "text" : "password"}
                    value={currentProviderKey}
                    onChange={(event) => onProviderKeyChange(event.target.value)}
                    placeholder={`Paste your ${currentMeta.keyLabel}`}
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/24 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/30 focus:border-amber-300"
                  />
                  <button
                    type="button"
                    onClick={onToggleShowKey}
                    className="rounded-2xl bg-white/10 px-3 py-2.5 text-[11px] font-semibold text-white transition hover:bg-white/14"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onClearCurrentKey}
                  className="mt-3 rounded-full bg-white/10 px-3 py-2 text-[11px] font-semibold text-white/76 transition hover:bg-white/14"
                >
                  Clear Current Key
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
