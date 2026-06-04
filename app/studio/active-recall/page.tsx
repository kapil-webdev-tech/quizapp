import { AppShell } from "@/components/app-shell";
import { ActiveRecallGenerator } from "@/components/active-recall-generator";
import { ActiveRecallGeneratorPrintStyle } from "@/components/active-recall-generator-print-style";

export default function ActiveRecallPage() {
  return (
    <AppShell>
      <ActiveRecallGeneratorPrintStyle />
      <ActiveRecallGenerator />
    </AppShell>
  );
}
