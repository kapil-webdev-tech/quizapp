type ProcessingOverlayProps = {
  state: {
    title: string;
    description: string;
  } | null;
};

export function ProcessingOverlay({ state }: ProcessingOverlayProps) {
  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#17181d] p-6 text-white shadow-[0_32px_120px_rgba(0,0,0,0.42)]">
        <div className="flex items-center gap-4">
          <BusyIndicator />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Processing
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              {state.title}
            </h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/72">
          {state.description}
        </p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-amber-300" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Please wait. Actions are temporarily locked.
        </p>
      </div>
    </div>
  );
}

function BusyIndicator() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white"
    />
  );
}
