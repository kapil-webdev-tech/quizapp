"use client";

import { ReactNode } from "react";

type StickyPageHeaderProps = {
  leftContent: ReactNode;
  rightContent?: ReactNode;
};

export function StickyPageHeader({
  leftContent,
  rightContent,
}: StickyPageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-[rgba(255,252,245,0.92)] px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 print:hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {leftContent}
        </div>

        {rightContent ? (
          <div className="flex flex-wrap gap-2">
            {rightContent}
          </div>
        ) : null}
      </div>
    </div>
  );
}