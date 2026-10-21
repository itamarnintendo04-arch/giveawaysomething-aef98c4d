export type GuildAccess = { owner?: boolean; permissions?: string };
export function canManageGuild(guild: GuildAccess) {
  const permissions = BigInt(guild.permissions ?? "0");
  return Boolean(guild.owner) || (permissions & 8n) !== 0n || (permissions & 32n) !== 0n;
}

export function manageableGuilds<T extends GuildAccess>(guilds: T[]): T[] {
  return guilds.filter(canManageGuild);
}

export type PermissionRole = { id: string; permissions: string };
export type PermissionOverwrite = { id: string; type: number; allow: string; deny: string };
export function channelPermissions(guildId: string, memberId: string, roleIds: string[], roles: PermissionRole[], overwrites: PermissionOverwrite[]) {
  let permissions = roles.filter((role) => role.id === guildId || roleIds.includes(role.id)).reduce((bits, role) => bits | BigInt(role.permissions), 0n);
  if ((permissions & 8n) !== 0n) return ~0n;
  const everyone = overwrites.find((entry) => entry.id === guildId && entry.type === 0);
  if (everyone) permissions = (permissions & ~BigInt(everyone.deny)) | BigInt(everyone.allow);
  const roleOverwrites = overwrites.filter((entry) => entry.type === 0 && roleIds.includes(entry.id));
  const deny = roleOverwrites.reduce((bits, entry) => bits | BigInt(entry.deny), 0n);
  const allow = roleOverwrites.reduce((bits, entry) => bits | BigInt(entry.allow), 0n);
  permissions = (permissions & ~deny) | allow;
  const personal = overwrites.find((entry) => entry.type === 1 && entry.id === memberId);
  if (personal) permissions = (permissions & ~BigInt(personal.deny)) | BigInt(personal.allow);
  return permissions;
}