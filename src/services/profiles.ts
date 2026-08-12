import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { validateAvatarFile } from "@/lib/validation/schemas";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const AVATAR_BUCKET = "avatars";

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMyProfile(userId: string, values: ProfileUpdate): Promise<Profile> {
  const existing = await getMyProfile(userId);
  if (existing) {
    const { data, error } = await supabase
      .from("profiles")
      .update(values)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("profiles")
    .insert({ ...values, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Private bucket: return a short-lived signed URL for display. */
export async function getAvatarSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const validationError = validateAvatarFile(file);
  if (validationError) throw new Error(validationError);

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  await upsertMyProfile(userId, { avatar_url: path });
  return path;
}

export async function removeAvatar(userId: string, path: string | null): Promise<void> {
  if (path) await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  await upsertMyProfile(userId, { avatar_url: null });
}
