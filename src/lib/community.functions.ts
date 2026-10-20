import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { feedbackSchema, onboardingSchema, botInviteUrl } from "./community";

export const getCommunityState = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const { requireDiscordUser } = await import("./discord.server");
  const user = await requireDiscordUser(getRequest());
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("discord_onboarding").select("discord_user_id").eq("discord_user_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load your welcome preferences. Please retry.");
  return { needsOnboarding: !data, inviteUrl: botInviteUrl(process.env["DISCORD_CLIENT_ID"] ?? "") };
});

export const completeOnboarding = createServerFn({ method: "POST" }).inputValidator((data: { botAlreadyInstalled: boolean }) => onboardingSchema.parse(data)).handler(async ({ data }) => {
  const { requireDiscordUser } = await import("./discord.server");
  const user = await requireDiscordUser(getRequest());
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("discord_onboarding").upsert({ discord_user_id: user.id, bot_already_installed: data.botAlreadyInstalled }, { onConflict: "discord_user_id", ignoreDuplicates: true });
  if (error) throw new Error("Could not save your answer. Please retry.");
  return { saved: true };
});

export const sendFeedback = createServerFn({ method: "POST" }).inputValidator((data: { category: string; message: string }) => feedbackSchema.parse(data)).handler(async ({ data }) => {
  const { requireDiscordUser } = await import("./discord.server");
  const user = await requireDiscordUser(getRequest());
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("discord_feedback").insert({ discord_user_id: user.id, ...data });
  if (error) throw new Error("Feedback was not saved. Please retry.");
  return { saved: true };
});

export const getMyFeedback = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const { requireDiscordUser } = await import("./discord.server");
  const user = await requireDiscordUser(getRequest());
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("discord_feedback").select("id,category,message,created_at").eq("discord_user_id", user.id).order("created_at", { ascending: false }).limit(5);
  if (error) throw new Error("Could not load your feedback.");
  return data;
});