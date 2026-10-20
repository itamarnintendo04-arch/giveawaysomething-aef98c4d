import { describe, expect, it } from "vitest";
import { botInviteUrl, feedbackSchema, onboardingSchema } from "@/lib/community";
describe("Invitations and feedback", () => {
  it("creates a bot invitation for the selected server", () => {
    const url = new URL(botInviteUrl("123456789012345678", "234567890123456789") ?? "https://invalid.local");
    expect(url.origin).toBe("https://discord.com");
    expect(url.searchParams.get("guild_id")).toBe("234567890123456789");
    expect(url.searchParams.get("scope")).toBe("bot applications.commands");
    expect(url.searchParams.get("permissions")).toBe("84928");
  });
  it("creates a server-choice invitation without a selected server", () => expect(new URL(botInviteUrl("123456789012345678") ?? "https://invalid.local").searchParams.has("guild_id")).toBe(false));
  it("rejects an unconfigured application", () => expect(botInviteUrl("")).toBeNull());
  for (const category of ["feature", "bug", "bot_issue", "experience"]) it(`accepts ${category} feedback`, () => expect(feedbackSchema.parse({ category, message: "My feedback" }).category).toBe(category));
  it("rejects unsupported feedback categories", () => expect(feedbackSchema.safeParse({ category: "other", message: "Hi" }).success).toBe(false));
  it("rejects empty feedback", () => expect(feedbackSchema.safeParse({ category: "bug", message: "  " }).success).toBe(false));
  it("records both onboarding answers", () => { expect(onboardingSchema.parse({ botAlreadyInstalled: true }).botAlreadyInstalled).toBe(true); expect(onboardingSchema.parse({ botAlreadyInstalled: false }).botAlreadyInstalled).toBe(false); });
});