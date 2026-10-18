import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export type Me = { id: string; username: string; displayName: string; avatarUrl: string };

export const getMe = createServerFn({ method: "GET" }).handler(async (): Promise<Me | null> => {
  const { readSession, getCookieFrom, SESSION_COOKIE } = await import("./session.server");
  const user = await readSession(getCookieFrom(getRequest(), SESSION_COOKIE));
  if (!user) return null;
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;
  return { id: user.id, username: user.username, displayName: user.global_name ?? user.username, avatarUrl };
});
