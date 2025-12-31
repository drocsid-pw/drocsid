export type DrocsidStatus = "online" | "idle" | "dnd" | "offline";

export type DrocsidPermission =
	| "MANAGE_GUILD_USERS"
	| "MANAGE_CHANNEL"
	| "ADMIN_DELETE_MESSAGES"
	| "MANAGE_GUILD"
	| "READ"
	| "WRITE";

const DROCSID_PERMISSIONS = [
	"MANAGE_GUILD_USERS",
	"MANAGE_CHANNEL",
	"ADMIN_DELETE_MESSAGES",
	"MANAGE_GUILD",
	"READ",
	"WRITE",
] as const satisfies readonly DrocsidPermission[];

function isDrocsidPermission(value: string): value is DrocsidPermission {
	return (DROCSID_PERMISSIONS as readonly string[]).includes(value);
}

export function parsePermissions(raw: string): DrocsidPermission[] {
	/**
	 * Parses backend permissions string into a typed permissions array.
	 * Keeps backend compatibility by being liberal in what it accepts:
	 * - supports common separators: comma, pipe, whitespace
	 * - ignores unknown values (does not throw)
	 * - de-duplicates while preserving order
	 */
	const parts = raw
		.split(/[,\s|]+/g)
		.map((v) => v.trim())
		.filter((v) => v.length > 0);

	const out: DrocsidPermission[] = [];
	for (const p of parts) {
		if (!isDrocsidPermission(p)) continue;
		if (out.includes(p)) continue;
		out.push(p);
	}

	return out;
}

export function serializePermissions(permissions: DrocsidPermission[], separator = ","): string {
	return permissions.join(separator);
}

export type DrocsidRole = {
	guildRoleId: string;
	roleName: string;

	permissions: DrocsidPermission[];

	permissionsRaw: string;

	system?: boolean;
};

export type DrocsidRoleList = {
	roles: DrocsidRole[];
};

export type DrocsidGuildUser = {
	guildUserId: string;
	nick: string;

	roles: DrocsidRoleList;

	roleIds: string[];
};

export type DrocsidUser = {
	id: string;
	name: string;
	avatarHash: string;
	avatarLetter: string;
};

export type DrocsidMessage = {
	messageId: string;
	author: DrocsidGuildUser;
	content: string;
	timestamp: string;
};

export type DrocsidChannel = {
	channelId: string;
	name: string;
	guildId: string;
	overrides: DrocsidRoleList;
	messages: DrocsidMessage[];
};

export type DrocsidGuild = {
	guildId: string;
	name: string;
	icon: string;
	ownerId: string;

	roles: DrocsidRole[];
	channels: DrocsidChannel[];
	users: DrocsidGuildUser[];
};

export type DrocsidFriend = {
	id: string;
	name: string;
	avatarLetter: string;
	status: DrocsidStatus;
};
