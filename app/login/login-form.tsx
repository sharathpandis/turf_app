"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { OTP_LENGTH } from "@/lib/auth-input";
import { sendOtp, verifyOtp } from "./actions";

const RESEND_SECONDS = 60;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function LoginForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [pending, startTransition] = useTransition();
  // A code works once: ignore a second verify (autofill can fire onComplete twice).
  const verifying = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  function send() {
    setError("");
    startTransition(async () => {
      const res = await sendOtp(email);
      if (!res.ok) return setError(res.error);
      setCode("");
      setStep("otp");
      setSecondsLeft(RESEND_SECONDS);
    });
  }

  function verify(value: string) {
    if (verifying.current) return;
    verifying.current = true;
    setError("");
    startTransition(async () => {
      const res = await verifyOtp(email, value);
      verifying.current = false;
      // On success the action redirects; we only get here on failure.
      if (res && !res.ok) {
        setError(res.error);
        setCode("");
      }
    });
  }

  if (step === "email") {
    return (
      <form
        className="mt-14 flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold">Log in</h1>
          <p className="text-base leading-normal text-muted-ink">
            Enter your email and we will send you a 6-digit code.
          </p>
        </div>
        <label htmlFor="email" className="mt-8 flex flex-col gap-1.5 text-sm text-muted-ink">
          Email address
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 rounded-xl border-[1.5px] bg-card px-3.5 text-base font-medium text-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
            autoFocus
          />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
        <div className="flex-1" />
        <Button type="submit" className="h-13 w-full rounded-xl text-base font-semibold" disabled={pending || !email.includes("@")}>
          {pending ? "Sending…" : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <div className="mt-14 flex flex-1 flex-col">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold">Enter your code</h1>
        <p className="text-base leading-normal text-muted-ink">
          We sent a {OTP_LENGTH}-digit code to <strong className="break-all text-ink">{email}</strong>
        </p>
        <button
          type="button"
          className="min-h-11 self-start text-sm font-semibold text-brand"
          disabled={pending}
          onClick={() => {
            setStep("email");
            setError("");
          }}
        >
          Change email
        </button>
      </div>
      <InputOTP
        aria-label="Login code"
        maxLength={OTP_LENGTH}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={setCode}
        onComplete={verify}
        disabled={pending}
        containerClassName="mt-4 w-full"
        autoFocus
      >
        <InputOTPGroup
          className="grid w-full gap-2"
          style={{ gridTemplateColumns: `repeat(${OTP_LENGTH}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: OTP_LENGTH }, (_, i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className="h-14 min-w-0 w-full rounded-xl border-[1.5px] bg-card font-heading text-[22px] font-semibold first:rounded-xl first:border-l last:rounded-xl data-[active=true]:border-2 data-[active=true]:bg-brand-soft data-[active=true]:ring-0"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-ink">
        <span>Code valid for 10 minutes</span>
        {secondsLeft > 0 ? (
          <span>
            Resend in <strong className="text-ink">{mmss(secondsLeft)}</strong>
          </span>
        ) : (
          <button type="button" className="min-h-11 font-semibold text-brand" disabled={pending} onClick={send}>
            Resend code
          </button>
        )}
      </div>
      <div className="flex-1" />
      <Button
        className="h-13 w-full rounded-xl text-base font-semibold"
        disabled={pending || code.length !== OTP_LENGTH}
        onClick={() => verify(code)}
      >
        {pending ? "Checking…" : "Verify and continue"}
      </Button>
      <p className="mt-4 text-center text-[13px] leading-normal text-muted-ink">
        Tip: type the code here. Opening the email on another phone still works.
      </p>
    </div>
  );
}
