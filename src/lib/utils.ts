import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email);
}

/** Phone is a required field on every lead form, so this only rejects entries
 * that can't be a real number: it counts digits and ignores the formatting
 * people actually type (+, spaces, dashes, brackets, a leading 00). 7 digits is
 * the shortest national number still in use; 15 is the E.164 maximum. */
export function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
