import { toast } from "@/hooks/use-toast";

/**
 * Maps backend errors to safe, human messages. Never surfaces raw database
 * text, stack traces, or internal identifiers to the user.
 */
export function friendlyErrorMessage(error: unknown): string {
  const raw = typeof error === "string" ? error : (error as { message?: string })?.message ?? "";
  const code = (error as { code?: string })?.code ?? "";
  const text = raw.toLowerCase();

  if (text.includes("invalid login credentials")) return "That email or password is incorrect.";
  if (text.includes("email not confirmed")) return "Please confirm your email address first.";
  if (text.includes("user already registered")) return "An account with this email already exists.";
  if (text.includes("rate limit") || code === "429") return "Too many attempts. Please wait a moment and try again.";
  if (text.includes("failed to fetch") || text.includes("network")) return "Network problem. Check your connection and try again.";
  if (code === "42501" || text.includes("row-level security") || text.includes("permission denied")) {
    return "You don't have permission to do that.";
  }
  if (code === "23505") return "That record already exists.";
  if (code === "23503") return "A related record is missing.";
  if (code === "PGRST116") return "We couldn't find that record.";
  if (text.includes("jwt") || text.includes("session")) return "Your session expired. Please sign in again.";

  return "Something went wrong. Please try again.";
}

export function notifyError(error: unknown, title = "Action failed") {
  // Keep the technical detail in the console for debugging only.
  console.error(title, error);
  toast({ variant: "destructive", title, description: friendlyErrorMessage(error) });
}

export function notifySuccess(title: string, description?: string) {
  toast({ title, description });
}
