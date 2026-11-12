"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { OTP_LENGTH } from "@/lib/auth-input";
import { sendOtp, verifyOtp } from "./actions";

const RESEND_SECONDS = 30;

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
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-base">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
            autoFocus
          />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-12 w-full text-base" disabled={pending || !email.includes("@")}>
          {pending ? "Sending…" : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="otp" className="text-base">
          Enter the {OTP_LENGTH}-digit code sent to {email}
        </Label>
        <InputOTP
          id="otp"
          maxLength={OTP_LENGTH}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={setCode}
          onComplete={verify}
          disabled={pending}
          autoFocus
        >
          <InputOTPGroup>
            {Array.from({ length: OTP_LENGTH }, (_, i) => (
              <InputOTPSlot key={i} index={i} className="h-12 w-9 text-lg" />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button className="h-12 w-full text-base" disabled={pending || code.length !== OTP_LENGTH} onClick={() => verify(code)}>
        {pending ? "Checking…" : "Verify and continue"}
      </Button>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="h-11 px-2"
          disabled={pending || secondsLeft > 0}
          onClick={send}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </Button>
        <Button
          variant="ghost"
          className="h-11 px-2"
          disabled={pending}
          onClick={() => {
            setStep("email");
            setError("");
          }}
        >
          Change email
        </Button>
      </div>
    </div>
  );
}
