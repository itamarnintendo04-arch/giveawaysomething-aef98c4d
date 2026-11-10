import { describe, expect, it } from "vitest";
import { createDropSchema, createGiveawaySchema, durationSeconds, removeParticipantSchema } from "@/lib/bot-api";
import { signDashboardRequest } from "@/lib/bot-api.server";

const ids = { guildId: "123456789012345678", channelId: "234567890123456789" };

describe("Bot dashboard inputs", () => {
  it("accepts a real giveaway duration and winner count", () => {
    const result = createGiveawaySchema.parse({ ...ids, prize: "Discord Nitro", duration: "10m", winners: 2 });
    expect(result.duration).toBe("10m");
    expect(result.winners).toBe(2);
  });
  it("converts the supported duration units", () => {
    expect(durationSeconds("30s")).toBe(30);
    expect(durationSeconds("10m")).toBe(600);
    expect(durationSeconds("2h")).toBe(7200);
    expect(durationSeconds("1d")).toBe(86400);
  });
  it("rejects an empty drop prize", () => expect(createDropSchema.safeParse({ ...ids, prize: "  " }).success).toBe(false));
  it("rejects a giveaway without winners", () => expect(createGiveawaySchema.safeParse({ ...ids, prize: "Nitro", duration: "2h", winners: 0 }).success).toBe(false));
  it("requires a Discord user ID when removing a participant", () => expect(removeParticipantSchema.safeParse({ guildId: ids.guildId, messageId: ids.channelId, userId: "not-a-user" }).success).toBe(false));
});

describe("Bot request authentication", () => {
  it("matches the bot's HMAC signature format without sending the token", async () => {
    const signature = await signDashboardRequest("test-bot-token", "1730000000", "test-nonce", '{"prize":"Nitro"}');
    expect(signature).toBe("a20962c4465214234fa52b5a659c8cb1ab173a98a5e1357d4907568290990056");
  });
});
