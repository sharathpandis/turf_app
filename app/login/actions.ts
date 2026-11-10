"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, otpSchema } from "@/lib/auth-input";

export type ActionResult = { ok: true } | { ok: false; error: string };

function friendlyError(code: string | undefined, fallback: string) {
  switch (code) {
    case "over_sms_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many tries. Please wait a minute and try again.";
    case "otp_expired":
      return "That code has expired. Tap Resend code.";
    case "over_email_send_rate_limit":
      return "Too many emails sent. Please wait a few minutes and try again.";
    case "email_provider_disabled":
    case "otp_disabled":
    case "signup_disabled":
    case "email_address_not_authorized":
      return "We could not send the code to this email. Please contact support.";
    default:
      return fallback;
  }
}

export async function sendOtp(rawEmail: string): Promise<ActionResult> {
  const email = emailSchema.safeParse(rawEmail);
  if (!email.success) return { ok: false, error: email.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email: email.data });
  if (error) return { ok: false, error: friendlyError(error.code, "Could not send the code. Please try again.") };
  return { ok: true };
}

export async function verifyOtp(rawEmail: string, rawCode: string): Promise<ActionResult> {
  const email = emailSchema.safeParse(rawEmail);
  if (!email.success) return { ok: false, error: email.error.issues[0].message };
  const code = otpSchema.safeParse(rawCode);
  if (!code.success) return { ok: false, error: code.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.data,
    token: code.data,
    type: "email",
  });
  if (error) return { ok: false, error: friendlyError(error.code, "That code is not correct. Please try again.") };

  redirect("/");
}
