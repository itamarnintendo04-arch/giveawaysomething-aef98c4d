import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import {
  botActionResponseSchema,
  botStateSchema,
  createDropSchema,
  createGiveawaySchema,
  dropResponseSchema,
  giveawayActionSchema,
  giveawayResponseSchema,
  removeParticipantSchema,
  snowflakeSchema,
} from "./bot-api";

export const getBotState = createServerFn({ method: "GET" })
  .inputValidator((input: { guildId: string }) => snowflakeSchema.parse(input.guildId))
  .handler(async ({ data: guildId }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { requireDiscordUser, requireManageableGuild } = await import("./discord.server");
    const { requestBot } = await import("./bot-api.server");
    const user = await requireDiscordUser(getRequest());
    await requireManageableGuild(user, guildId);
    return requestBot(process.env["DISCORD_BOT_API_URL"], process.env["DISCORD_BOT_TOKEN"], `/api/dashboard/state?guild_id=${guildId}&host_id=${user.id}`, "GET", null, botStateSchema);
  });

export const createGiveaway = createServerFn({ method: "POST" })
  .inputValidator(createGiveawaySchema)
  .handler(async ({ data }) => {
    const { requireDiscordUser, listChannels } = await import("./discord.server");
    const { requestBot } = await import("./bot-api.server");
    const user = await requireDiscordUser(getRequest());
    const channels = await listChannels(user, data.guildId);
    if (!channels.some((channel) => channel.id === data.channelId)) throw new Error("Choose a channel where you and the bot have access.");
    return requestBot(process.env["DISCORD_BOT_API_URL"], process.env["DISCORD_BOT_TOKEN"], "/api/dashboard/giveaways", "POST", { ...data, hostId: user.id }, giveawayResponseSchema);
  });

export const createDrop = createServerFn({ method: "POST" })
  .inputValidator(createDropSchema)
  .handler(async ({ data }) => {
    const { requireDiscordUser, listChannels } = await import("./discord.server");
    const { requestBot } = await import("./bot-api.server");
    const user = await requireDiscordUser(getRequest());
    const channels = await listChannels(user, data.guildId);
    if (!channels.some((channel) => channel.id === data.channelId)) throw new Error("Choose a channel where you and the bot have access.");
    return requestBot(process.env["DISCORD_BOT_API_URL"], process.env["DISCORD_BOT_TOKEN"], "/api/dashboard/drops", "POST", { ...data, hostId: user.id }, dropResponseSchema);
  });

export const endGiveaway = createServerFn({ method: "POST" })
  .inputValidator(giveawayActionSchema)
  .handler(async ({ data }) => {
    const { requireDiscordUser, requireManageableGuild } = await import("./discord.server");
    const { requestBot } = await import("./bot-api.server");
    const user = await requireDiscordUser(getRequest());
    await requireManageableGuild(user, data.guildId);
    return requestBot(process.env["DISCORD_BOT_API_URL"], process.env["DISCORD_BOT_TOKEN"], "/api/dashboard/giveaways/end", "POST", { ...data, hostId: user.id }, botActionResponseSchema);
  });

export const removeGiveawayParticipant = createServerFn({ method: "POST" })
  .inputValidator(removeParticipantSchema)
  .handler(async ({ data }) => {
    const { requireDiscordUser, requireManageableGuild } = await import("./discord.server");
    const { requestBot } = await import("./bot-api.server");
    const user = await requireDiscordUser(getRequest());
    await requireManageableGuild(user, data.guildId);
    return requestBot(process.env["DISCORD_BOT_API_URL"], process.env["DISCORD_BOT_TOKEN"], "/api/dashboard/giveaways/remove-participant", "POST", { ...data, hostId: user.id }, botActionResponseSchema);
  });
