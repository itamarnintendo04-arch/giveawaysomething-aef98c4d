import { getCookieFrom, readSession, SESSION_COOKIE, type DiscordUser } from "./session.server";
import { canManageGuild, manageableGuilds, channelPermissions, type PermissionRole, type PermissionOverwrite } from "./discord-permissions";

type Tokens = { access_token: string; refresh_token: string; expires_in: number };
type Guild = { id: string; name: string; icon: string | null; owner?: boolean; permissions?: string };
type Channel = { id: string; name: string; type: number; position: number; permission_overwrites?: PermissionOverwrite[] };
type Member = { roles: string[] };

async function encryptionKey() {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("Secure session configuration is missing.");
  return crypto.subtle.importKey("raw", await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret)), "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function encrypt(tokens: Tokens) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(), new TextEncoder().encode(JSON.stringify(tokens))));
  return JSON.stringify({ iv: Array.from(iv), data: Array.from(encrypted) });
}
async function decrypt(value: string): Promise<Tokens> {
  const stored = JSON.parse(value);
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(stored.iv) }, await encryptionKey(), new Uint8Array(stored.data))));
}

export async function saveDiscordConnection(userId: string, tokens: Tokens) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("discord_oauth_connections").insert({ discord_user_id: userId, encrypted_tokens: await encrypt(tokens), token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString() }).select("id").single();
  if (error || !data) throw new Error("Could not save your Discord connection.");
  return data.id;
}

export async function requireDiscordUser(request: Request) {
  const user = await readSession(getCookieFrom(request, SESSION_COOKIE));
  if (!user) throw new Error("Sign in with Discord to continue.");
  return user;
}

async function accessToken(user: DiscordUser) {
  if (!user.connectionId) throw new Error("Reconnect Discord to load your servers.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("discord_oauth_connections").select("encrypted_tokens,token_expires_at,session_expires_at").eq("id", user.connectionId).eq("discord_user_id", user.id).single();
  if (error || !data || Date.parse(data.session_expires_at) <= Date.now()) throw new Error("Your Discord connection expired. Please reconnect.");
  let tokens = await decrypt(data.encrypted_tokens);
  if (Date.parse(data.token_expires_at) < Date.now() + 60000) {
    const response = await fetch("https://discord.com/api/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: process.env["DISCORD_CLIENT_ID"] ?? "", client_secret: process.env["DISCORD_CLIENT_SECRET"] ?? "", grant_type: "refresh_token", refresh_token: tokens.refresh_token }) });
    if (!response.ok) throw new Error("Your Discord connection expired. Please reconnect.");
    tokens = await response.json() as Tokens;
    const { error: updateError } = await supabaseAdmin.from("discord_oauth_connections").update({ encrypted_tokens: await encrypt(tokens), token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString() }).eq("id", user.connectionId).eq("discord_user_id", user.id);
    if (updateError) throw new Error("Could not refresh your Discord connection.");
  }
  return tokens.access_token;
}

async function discord<T>(path: string, authorization: string): Promise<T> {
  const response = await fetch(`https://discord.com/api/v10${path}`, { headers: { Authorization: authorization } });
  if (!response.ok) {
    // Discord error text contains no OAuth exchange or credential values.
    console.error(`Discord resource request failed [${response.status}]: ${await response.text()}`);
    throw new Error(response.status === 429 ? "Discord is busy. Try again shortly." : response.status === 401 ? "Discord connection failed. Please reconnect." : "Discord could not load this server. Check the bot's access and permissions.");
  }
  return await response.json() as T;
}
function botAuthorization() {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) throw new Error("The Discord bot is not connected.");
  return `Bot ${token}`;
}
async function allGuilds(authorization: string) {
  const result: Guild[] = [];
  let after = "";
  for (let page = 0; page < 20; page++) {
    const rows = await discord<Guild[]>(`/users/@me/guilds?limit=200${after ? `&after=${after}` : ""}`, authorization);
    result.push(...rows);
    if (rows.length < 200) return result;
    after = rows.at(-1)?.id ?? "";
  }
  throw new Error("Too many servers to load. Please contact support.");
}
export async function listGuilds(user: DiscordUser) {
  const [guilds, botGuilds] = await Promise.all([allGuilds(`Bearer ${await accessToken(user)}`), allGuilds(botAuthorization())]);
  const installed = new Set(botGuilds.map((guild) => guild.id));
  return manageableGuilds(guilds).map((guild) => ({ id: guild.id, name: guild.name, iconUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64` : null, manageable: true, botInstalled: installed.has(guild.id) })).sort((a, b) => a.name.localeCompare(b.name));
}
export async function listChannels(user: DiscordUser, guildId: string) {
  const guilds = await allGuilds(`Bearer ${await accessToken(user)}`);
  const guild = guilds.find((entry) => entry.id === guildId);
  if (!guild || !canManageGuild(guild)) throw new Error("You need Manage Server permission to manage giveaways in this server.");
  const authorization = botAuthorization();
  const bot = await discord<{ id: string }>("/users/@me", authorization);
  const [channels, roles, userMember, botMember] = await Promise.all([
    discord<Channel[]>(`/guilds/${guildId}/channels`, authorization),
    discord<PermissionRole[]>(`/guilds/${guildId}/roles`, authorization),
    discord<Member>(`/guilds/${guildId}/members/${user.id}`, authorization),
    discord<Member>(`/guilds/${guildId}/members/${bot.id}`, authorization),
  ]);
  const requiredBot = 1024n | 2048n | 65536n | 64n | 16384n;
  return channels.filter((channel) => {
    if (channel.type !== 0 && channel.type !== 5) return false;
    const overwrites = channel.permission_overwrites ?? [];
    const userBits = guild.owner ? ~0n : channelPermissions(guildId, user.id, userMember.roles, roles, overwrites);
    const botBits = channelPermissions(guildId, bot.id, botMember.roles, roles, overwrites);
    return (userBits & 1024n) !== 0n && (botBits & requiredBot) === requiredBot;
  }).sort((a, b) => a.position - b.position).map((channel) => ({ id: channel.id, name: channel.name }));
}