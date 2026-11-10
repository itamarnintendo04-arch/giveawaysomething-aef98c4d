import { z } from "zod";

export const snowflakeSchema = z.string().regex(/^\d{17,20}$/, "Invalid Discord ID.");

export const createGiveawaySchema = z.object({
  guildId: snowflakeSchema,
  channelId: snowflakeSchema,
  prize: z.string().trim().min(1, "Enter a prize.").max(200, "Prize must be 200 characters or fewer."),
  duration: z.string().trim().toLowerCase().regex(/^\d{1,4}[smhd]?$/, "Use a duration such as 10m, 2h or 1d.").refine((value) => {
    const seconds = durationSeconds(value);
    return seconds > 0 && seconds <= 31_536_000;
  }, "Duration must be between 1 second and 365 days."),
  winners: z.number().int().min(1, "Choose at least one winner.").max(25, "Choose up to 25 winners."),
});

export const createDropSchema = z.object({
  guildId: snowflakeSchema,
  channelId: snowflakeSchema,
  prize: z.string().trim().min(1, "Enter a prize.").max(200, "Prize must be 200 characters or fewer."),
});

export const giveawayActionSchema = z.object({ guildId: snowflakeSchema, messageId: snowflakeSchema });
export const removeParticipantSchema = giveawayActionSchema.extend({ userId: snowflakeSchema });

export function durationSeconds(value: string) {
  const match = /^(\d{1,4})([smhd])?$/.exec(value.trim().toLowerCase());
  if (!match) return 0;
  const amount = Number(match[1]);
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2] ?? "s"] ?? 1;
  return amount * multiplier;
}

export const participantSchema = z.object({
  id: snowflakeSchema,
  displayName: z.string(),
  username: z.string(),
  avatarUrl: z.string().url().nullable(),
});

export const giveawaySchema = z.object({
  messageId: snowflakeSchema,
  channelId: snowflakeSchema,
  guildId: snowflakeSchema,
  prize: z.string(),
  winnersCount: z.number().int(),
  endTime: z.number(),
  createdAt: z.number(),
  hostId: snowflakeSchema,
  hostName: z.string(),
  participants: z.array(participantSchema),
});

export const dropSchema = z.object({
  messageId: snowflakeSchema,
  channelId: snowflakeSchema,
  guildId: snowflakeSchema,
  prize: z.string(),
  createdAt: z.number(),
  hostId: snowflakeSchema,
  hostName: z.string(),
});

export const botStateSchema = z.object({
  giveaways: z.array(giveawaySchema),
  drops: z.array(dropSchema),
});

export const giveawayResponseSchema = z.object({ giveaway: giveawaySchema });
export const dropResponseSchema = z.object({ drop: dropSchema });
export const botActionResponseSchema = z.object({ ok: z.literal(true) });

export type BotState = z.infer<typeof botStateSchema>;
export type Giveaway = z.infer<typeof giveawaySchema>;
export type Drop = z.infer<typeof dropSchema>;
export type Participant = z.infer<typeof participantSchema>;
