import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

export const getDiscordGuilds = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const { requireDiscordUser, listGuilds } = await import("./discord.server");
  return listGuilds(await requireDiscordUser(getRequest()));
});
export const getDiscordChannels = createServerFn({ method: "GET" })
  .inputValidator((input: { guildId: string }) => z.object({ guildId: z.string().regex(/^\d{17,20}$/) }).parse(input))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { requireDiscordUser, listChannels } = await import("./discord.server");
    return listChannels(await requireDiscordUser(getRequest()), data.guildId);
  });