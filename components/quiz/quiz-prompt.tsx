import {
  formatQuestionPrompt,
  inferStructuredPromptType,
  isStructuredPromptLine,
  parseMatchFollowingPrompt,
} from "@/lib/question-prompt-format";
import { cn } from "@/lib/utils";

type QuizPromptVariant = "attempt" | "preview";

const promptStyles: Record<
  QuizPromptVariant,
  {
    wrapper: string;
    intro: string;
    tableWrapper: string;
    tableCell: string;
    footer: string;
    listWrapper: string;
    structuredLine: string;
    defaultLine: string;
  }
> = {
  attempt: {
    wrapper: "min-w-0 max-w-full space-y-4 sm:mt-6",
    intro:
      "break-words [overflow-wrap:anywhere] text-xl font-semibold leading-8 text-slate-900 sm:text-2xl sm:leading-10",
    tableWrapper:
      "overflow-hidden rounded-[22px] border border-black/10 bg-stone-50",
    tableCell:
      "align-top px-4 py-3 text-sm leading-7 text-slate-800 sm:px-5",
    footer: "text-base font-medium leading-8 text-slate-900 sm:text-lg",
    listWrapper: "min-w-0 max-w-full space-y-3 sm:mt-6",
    structuredLine:
      "break-words [overflow-wrap:anywhere] pl-4 text-base font-medium leading-8 text-slate-900 sm:pl-5 sm:text-lg",
    defaultLine:
      "break-words [overflow-wrap:anywhere] text-xl font-semibold leading-8 text-slate-900 sm:text-2xl sm:leading-10",
  },
  preview: {
    wrapper: "mt-4 space-y-4",
    intro: "text-lg font-semibold leading-8 text-slate-950",
    tableWrapper:
      "overflow-hidden rounded-[24px] border border-black/10 bg-stone-50",
    tableCell: "align-top px-4 py-3 text-sm leading-7 text-slate-800",
    footer: "text-base font-medium leading-8 text-slate-900",
    listWrapper: "mt-4 space-y-3",
    structuredLine:
      "pl-4 text-base font-medium leading-8 text-slate-900 sm:pl-5",
    defaultLine: "text-lg font-semibold leading-8 text-slate-950",
  },
};

function MatchFollowingPrompt({
  prompt,
  variant,
}: {
  prompt: string;
  variant: QuizPromptVariant;
}) {
  const styles = promptStyles[variant];
  const parsedPrompt = parseMatchFollowingPrompt(prompt);

  if (!parsedPrompt) {
    return null;
  }

  const rowCount = Math.max(
    parsedPrompt.leftItems.length,
    parsedPrompt.rightItems.length,
  );

  return (
    <div className={styles.wrapper}>
      {parsedPrompt.intro ? (
        <p className={styles.intro}>{parsedPrompt.intro}</p>
      ) : null}
      <div className={styles.tableWrapper}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-black/10 bg-white">
              <th className="w-1/2 px-4 py-3 text-sm font-semibold text-slate-900 sm:px-5">
                {parsedPrompt.listIHeading}
              </th>
              <th className="w-1/2 px-4 py-3 text-sm font-semibold text-slate-900 sm:px-5">
                {parsedPrompt.listIIHeading}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, index) => {
              const leftItem = parsedPrompt.leftItems[index];
              const rightItem = parsedPrompt.rightItems[index];

              return (
                <tr
                  key={`${leftItem?.marker ?? "left"}-${rightItem?.marker ?? "right"}-${index}`}
                  className="border-b border-black/8 last:border-b-0"
                >
                  <td className={styles.tableCell}>
                    {leftItem ? (
                      <>
                        <span className="mr-2 font-semibold text-slate-950">
                          {leftItem.marker}.
                        </span>
                        {leftItem.text}
                      </>
                    ) : null}
                  </td>
                  <td className={styles.tableCell}>
                    {rightItem ? (
                      <>
                        <span className="mr-2 font-semibold text-slate-950">
                          {rightItem.marker}.
                        </span>
                        {rightItem.text}
                      </>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {parsedPrompt.footer ? (
        <p className={styles.footer}>{parsedPrompt.footer}</p>
      ) : null}
    </div>
  );
}

export function QuizPrompt({
  prompt,
  variant = "attempt",
  className,
}: {
  prompt: string;
  variant?: QuizPromptVariant;
  className?: string;
}) {
  if (inferStructuredPromptType(prompt) === "match-the-following") {
    return (
      <div className={className}>
        <MatchFollowingPrompt prompt={prompt} variant={variant} />
      </div>
    );
  }

  const styles = promptStyles[variant];
  const segments = formatQuestionPrompt(prompt);

  return (
    <div className={cn(styles.listWrapper, className)}>
      {segments.map((segment, index) => (
        <p
          key={`${variant}-${index}-${segment.slice(0, 24)}`}
          className={
            isStructuredPromptLine(segment)
              ? styles.structuredLine
              : styles.defaultLine
          }
        >
          {segment}
        </p>
      ))}
    </div>
  );
}
