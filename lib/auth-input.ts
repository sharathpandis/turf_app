import { z } from "zod";

// Must match "Email OTP Length" in Supabase (Authentication > Providers > Email).
export const OTP_LENGTH = 8;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const otpSchema = z
  .string()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`);
