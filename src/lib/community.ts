import { z } from "zod";

export const feedbackCategories = [
  { value: "feature", label: "Feature suggestion" },
  { value: "bug", label: "Bug report" },
  { value: "bot_issue", label: "Bot issue" },
  { value: "experience", label: "User experience" },
] as const;
export const feedbackSchema = z.object({ category: z.enum(["feature", "bug", "bot_issue", "experience"]), message: z.string().trim().min(1).max(5000) });
export const onboardingSchema = z.object({ botAlreadyInstalled: z.boolean() });
export function botInviteUrl(clientId: string, guildId?: string) {
  if (!/^\d{17,20}$/.test(clientId)) return null;
  const params = new URLSearchParams({ client_id: clientId, scope: "bot applications.commands", permissions: "84928", integration_type: "0" });
  if (guildId && /^\d{17,20}$/.test(guildId)) { params.set("guild_id", guildId); params.set("disable_guild_select", "true"); }
  return `https://discord.com/oauth2/authorize?${params}`;
}