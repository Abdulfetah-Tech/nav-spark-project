import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];
export type ProviderInsert = Database["public"]["Tables"]["service_providers"]["Insert"];
export type ProviderUpdate = Database["public"]["Tables"]["service_providers"]["Update"];

export type ProviderSort = "rating" | "price_low" | "price_high" | "newest";

export interface ProviderQuery {
  search?: string;
  serviceType?: string;
  sort?: ProviderSort;
  page?: number;
  pageSize?: number;
}

export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listProviders({
  search = "",
  serviceType = "",
  sort = "rating",
  page = 1,
  pageSize = 12,
}: ProviderQuery = {}): Promise<Paged<ServiceProvider>> {
  const from = (page - 1) * pageSize;
  let query = supabase
    .from("service_providers")
    .select("*", { count: "exact" })
    .eq("verified", true);

  const term = search.trim();
  if (term) {
    const safe = term.replace(/[%,()]/g, " ");
    query = query.or(
      `business_name.ilike.%${safe}%,service_type.ilike.%${safe}%,description.ilike.%${safe}%`,
    );
  }
  if (serviceType && serviceType !== "all") query = query.eq("service_type", serviceType);

  if (sort === "rating") query = query.order("rating", { ascending: false });
  if (sort === "price_low") query = query.order("hourly_rate", { ascending: true, nullsFirst: false });
  if (sort === "price_high") query = query.order("hourly_rate", { ascending: false, nullsFirst: false });
  if (sort === "newest") query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getMyProviderListing(userId: string): Promise<ServiceProvider | null> {
  const { data, error } = await supabase
    .from("service_providers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProviderListing(values: ProviderInsert): Promise<ServiceProvider> {
  const { data, error } = await supabase.from("service_providers").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateProviderListing(
  id: string,
  values: ProviderUpdate,
): Promise<ServiceProvider> {
  const { data, error } = await supabase
    .from("service_providers")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
