export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

export const SESSION_COOKIE = "gs_session";
export const STATE_COOKIE = "gs_oauth_state";

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(str: string) {
  const s = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function sign(data: string) {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET missing");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data))));
}

export async function createSession(user: DiscordUser) {
  const payload = b64url(enc.encode(JSON.stringify({ ...user, exp: Date.now() + 7 * 864e5 })));
  return `${payload}.${await sign(payload)}`;
}

export async function readSession(token: string | undefined): Promise<DiscordUser | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || (await sign(payload)) !== sig) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (data.exp < Date.now()) return null;
    return { id: data.id, username: data.username, global_name: data.global_name, avatar: data.avatar };
  } catch {
    return null;
  }
}

export function getCookieFrom(request: Request, name: string) {
  const m = (request.headers.get("cookie") ?? "").match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
