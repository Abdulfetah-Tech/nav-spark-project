import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "cancel_booking",
  title: "Cancel a booking",
  description:
    "Cancel an existing booking by ID. Only the customer who created it or the assigned provider can cancel, and completed or already cancelled bookings are rejected.",
  inputSchema: {
    booking_id: z.string().uuid().describe("ID of the booking to cancel."),
    reason: z.string().trim().max(500).optional().describe("Optional cancellation reason."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ booking_id, reason }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    // RLS already restricts visibility to the booking's customer or provider.
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id,status,customer_id,provider_id,service_type,scheduled_date")
      .eq("id", booking_id)
      .maybeSingle();

    if (fetchError) {
      return { content: [{ type: "text", text: fetchError.message }], isError: true };
    }
    if (!booking) {
      return {
        content: [{ type: "text", text: "Booking not found or you are not allowed to access it." }],
        isError: true,
      };
    }
    if (booking.status === "cancelled") {
      return {
        content: [{ type: "text", text: "This booking is already cancelled." }],
        structuredContent: { booking },
      };
    }
    if (booking.status === "completed") {
      return { content: [{ type: "text", text: "A completed booking cannot be cancelled." }], isError: true };
    }

    const isCustomer = booking.customer_id === ctx.getUserId();
    const update: Record<string, unknown> = { status: "cancelled" };
    // Only the customer may edit notes; providers can only change status.
    if (reason && isCustomer) update.notes = reason;

    const { data, error } = await supabase
      .from("bookings")
      .update(update)
      .eq("id", booking_id)
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: "You are not authorized to cancel this booking." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { booking: data },
    };
  },
});
