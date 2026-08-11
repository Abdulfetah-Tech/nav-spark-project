import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_booking",
  title: "Create a booking",
  description: "Create a service booking for the signed-in customer with a chosen provider.",
  inputSchema: {
    provider_id: z.string().uuid().describe("ID of the service provider to book."),
    service_type: z.string().trim().min(1).describe("Type of service requested."),
    scheduled_date: z.string().trim().min(1).describe("Requested date/time (ISO 8601)."),
    notes: z.string().trim().max(2000).optional().describe("Optional details for the provider."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ provider_id, service_type, scheduled_date, notes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("bookings")
      .insert({
        customer_id: ctx.getUserId(),
        provider_id,
        service_type,
        scheduled_date,
        notes: notes ?? null,
      })
      .select()
      .maybeSingle();
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data) }],
          structuredContent: { booking: data },
        };
  },
});
