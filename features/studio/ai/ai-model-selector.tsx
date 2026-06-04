"use client";

import { ChevronDown } from "react-feather";
import type { StudioProvider } from "@/features/studio/shared/types";
import { studioProviders } from "./utils/ai-studio-config";

type AiModelSelectorProps = {
  provider: StudioProvider;
  open: boolean;
  onToggle: () => void;
  onSelect: (provider: StudioProvider) => void;
};

export function AiModelSelector({
  provider,
  open,
  onToggle,
  onSelect,
}: AiModelSelectorProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/12"
      >
        {provider}
        <ChevronDown />
      </button>

      {open ? (
        <div className="popup-surface popup-scroll absolute right-0 top-[calc(100%+10px)] z-20 max-h-[min(24rem,calc(100vh-9rem))] w-64 overflow-y-auto rounded-[22px] border border-white/8 bg-[#24242a]/96 p-2 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">
            Model
          </p>
          {studioProviders.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={`flex w-full items-start justify-between rounded-[18px] px-3 py-2.5 text-left transition ${
                provider === item
                  ? "bg-white/8 text-white"
                  : "text-white/72 hover:bg-white/[0.045]"
              }`}
            >
              <span>
                <span className="block text-[13px] font-semibold">{item}</span>
                <span className="mt-1 block text-[11px] leading-4 text-white/44">
                  {item === "Gemini"
                    ? "Fast multimodal drafting"
                    : item === "ChatGPT"
                      ? "Strong structured quiz generation"
                      : "Long-form reasoning and synthesis"}
                </span>
              </span>
              {provider === item ? (
                <span className="mt-1 text-emerald-300">✓</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
