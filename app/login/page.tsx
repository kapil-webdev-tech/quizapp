import { AppShell } from "@/components/app-shell";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <AppShell>
      <LoginForm />
    </AppShell>
  );
}
