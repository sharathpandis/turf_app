import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="text-muted-foreground">Log in with your email to manage your turf bookings.</p>
      </header>
      <LoginForm />
    </main>
  );
}
