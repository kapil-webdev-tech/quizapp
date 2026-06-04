import { AppShell } from "@/components/app-shell";
import { ActiveRecallGeneratorPrintStyle } from "@/components/active-recall-generator-print-style";
import { ActiveRecallSheetPlayer } from "@/components/active-recall-sheet-player";

export default function ActiveRecallSheetPage() {
  return (
    <AppShell>
      <ActiveRecallGeneratorPrintStyle />
      <ActiveRecallSheetPlayer />
    </AppShell>
  );
}
