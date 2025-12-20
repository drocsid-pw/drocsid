export type DrocsidStatus = "online" | "idle" | "dnd" | "offline";

export type DrocsidPermission = "MANAGE_GUILD_USERS" | "MANAGE_CHANNEL" | "ADMIN_DELETE_MESSAGES" | "MANAGE_GUILD" | "READ" | "WRITE";

export type DrocsidRole = {
	guildRoleId: string;
	roleName: string;
	permissions: string;
	system?: boolean;
};

export type DrocsidRoleList = {
	roles: DrocsidRole[];
};

export type DrocsidGuildUser = {
	guildUserId: string;
	nick: string;
	roles: DrocsidRoleList;
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
