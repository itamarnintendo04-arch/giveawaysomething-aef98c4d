import { describe, expect, it } from "vitest";
import { canManageGuild, manageableGuilds, channelPermissions } from "@/lib/discord-permissions";

describe("Discord management authorization", () => {
  it("lists only owned, Administrator or Manage Server guilds, including those without the bot", () => {
    expect(manageableGuilds([
      { id: "owner", owner: true, permissions: "0", botInstalled: false },
      { id: "admin", permissions: "8", botInstalled: true },
      { id: "manager", permissions: "32", botInstalled: false },
      { id: "member", permissions: "1024", botInstalled: true },
      { id: "moderator", permissions: "16", botInstalled: true },
      { id: "unknown" },
    ]).map((guild) => guild.id)).toEqual(["owner", "admin", "manager"]);
  });
  it("allows the guild owner", () => expect(canManageGuild({ owner: true, permissions: "0" })).toBe(true));
  it("allows Manage Server", () => expect(canManageGuild({ permissions: "32" })).toBe(true));
  it("allows Administrator", () => expect(canManageGuild({ permissions: "8" })).toBe(true));
  it("rejects membership with no management permission", () => expect(canManageGuild({ permissions: "1024" })).toBe(false));
  it("applies member channel denies after role allows", () => {
    const bits = channelPermissions("guild", "user", ["role"], [{ id: "guild", permissions: "1024" }, { id: "role", permissions: "2048" }], [{ id: "role", type: 0, allow: "1024", deny: "0" }, { id: "user", type: 1, allow: "0", deny: "1024" }]);
    expect(bits & 1024n).toBe(0n);
    expect(bits & 2048n).toBe(2048n);
  });
  it("ignores unrelated roles and overwrites", () => {
    expect(channelPermissions("guild", "user", [], [{ id: "guild", permissions: "1024" }, { id: "other", permissions: "8" }], [{ id: "other", type: 0, allow: "2048", deny: "1024" }])).toBe(1024n);
  });
});