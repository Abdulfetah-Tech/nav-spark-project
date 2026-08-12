import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Paged } from "./providers";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];

export interface BookingQuery {
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function listMyBookings({
  status = "all",
  page = 1,
  pageSize = 10,
}: BookingQuery = {}): Promise<Paged<Booking>> {
  const from = (page - 1) * pageSize;
  let query = supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .order("scheduled_date", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

export async function createBooking(values: BookingInsert): Promise<Booking> {
  const { data, error } = await supabase.from("bookings").insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}
