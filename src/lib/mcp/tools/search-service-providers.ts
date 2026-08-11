import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_service_providers",
  title: "Search service providers",
  description: "Search Fetan service providers by service type or business name.",
  inputSchema: {
    service_type: z.string().trim().optional().describe("Service type filter, e.g. plumbing."),
    query: z.string().trim().optional().describe("Text to match against business name."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ service_type, query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("service_providers")
      .select("id,business_name,service_type,description,hourly_rate,rating,total_reviews,service_area")
      .order("rating", { ascending: false })
      .limit(limit ?? 10);
    if (service_type) q = q.ilike("service_type", `%${service_type}%`);
    if (query) q = q.ilike("business_name", `%${query}%`);
    const { data, error } = await q;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { providers: data ?? [] },
        };
  },
});
