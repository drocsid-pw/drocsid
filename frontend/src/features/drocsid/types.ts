export type DrocsidStatus = "online" | "idle" | "dnd" | "offline";

export type DrocsidMessage = {
	id: bigint;
	authorId: bigint;
	authorName: string;
	timestamp: string;
	content: string;
	channelId: bigint;
};

export type DrocsidPermission = "MANAGE_GUILD_USERS" | "MANAGE_CHANNEL" | "ADMIN_DELETE_MESSAGES" | "MANAGE_GUILD" | "READ" | "WRITE";

export type DrocsidRole = {
	id: string;
	name: string;
	permissions: DrocsidPermission[];
	system?: boolean;
};

export type DrocsidChannel = {
	id: bigint;
	name: string;
	messages: DrocsidMessage[];
	overrides?: DrocsidRole[];
};

export type DrocsidGuildUser = {
	id: string;
	nick: string;
	roleIds: string[];
};

export type DrocsidGuild = {
	id: bigint;
	name: string;
	icon: string;
	ownerId: bigint;
	channels: DrocsidChannel[];
	roles?: DrocsidRole[];
	users?: DrocsidGuildUser[];
};

export type DrocsidUser = {
	id: bigint;
	name: string;
	avatarLetter: string;
	avatarHash: string;
};

export type DrocsidFriend = DrocsidUser;
