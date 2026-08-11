import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchServiceProvidersTool from "./tools/search-service-providers";
import listMyBookingsTool from "./tools/list-my-bookings";
import createBookingTool from "./tools/create-booking";
import listMyQuotationsTool from "./tools/list-my-quotations";
import getMyProfileTool from "./tools/get-my-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "fetan",
  title: "fetan",
  version: "0.1.0",
  instructions:
    "Tools for Fetan, a home services marketplace. Search service providers, view the signed-in user's bookings, quotations and profile, and create new bookings. All tools act as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchServiceProvidersTool,
    listMyBookingsTool,
    createBookingTool,
    listMyQuotationsTool,
    getMyProfileTool,
  ],
});
