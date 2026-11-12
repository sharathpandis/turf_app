import { Logo } from "@/components/shell/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-1 flex-col px-6 pt-18 pb-8">
      <Logo size="lg" />
      <LoginForm />
    </main>
  );
}
