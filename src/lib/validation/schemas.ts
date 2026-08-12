import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/\d/, "Include at least one number");

export const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: emailSchema,
  password: passwordSchema,
  userType: z.enum(["customer", "provider"]),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ()-]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
});

export const providerListingSchema = z.object({
  business_name: z.string().trim().min(2, "Business name is required").max(150),
  service_type: z.string().trim().min(2, "Service type is required").max(80),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  hourly_rate: z.coerce.number().min(0, "Rate cannot be negative").max(1000000).optional(),
  service_area: z.string().trim().max(150).optional().or(z.literal("")),
  years_experience: z.coerce.number().int().min(0).max(80).optional(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_MIME_TYPES.includes(file.type as (typeof AVATAR_MIME_TYPES)[number])) {
    return "Use a JPG, PNG, or WebP image.";
  }
  if (file.size > AVATAR_MAX_BYTES) return "Image must be smaller than 2 MB.";
  return null;
}

export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProviderListingInput = z.infer<typeof providerListingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
