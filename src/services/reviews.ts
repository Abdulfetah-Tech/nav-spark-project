import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

export async function listProviderReviews(providerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function listMyReviews(customerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("customer_id", customerId);
  if (error) throw error;
  return data ?? [];
}

export async function createReview(values: ReviewInsert): Promise<Review> {
  const { data, error } = await supabase.from("reviews").insert(values).select().single();
  if (error) throw error;
  return data;
}
