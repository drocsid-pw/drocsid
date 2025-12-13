export type DrocsidStatus = "online" | "idle" | "dnd" | "offline";

export type DrocsidMessage = {
	id: string;
	user: string;
	time: string;
	text: string;
};

export type DrocsidPermission = "MANAGE_GUILD_USERS" | "MANAGE_CHANNEL" | "ADMIN_DELETE_MESSAGES" | "MANAGE_GUILD" | "READ" | "WRITE";

export type DrocsidRole = {
	id: string;
	name: string;
	permissions: DrocsidPermission[];
	system?: boolean;
};

export type DrocsidChannel = {
	id: string;
	name: string;
	type: "text";
	topic?: string;
	messages: DrocsidMessage[];
	overrides?: DrocsidRole[];
};

export type DrocsidGuildUser = {
	id: string;
	nick: string;
	roleIds: string[];
};

export type DrocsidServer = {
	id: string;
	name: string;
	icon: string;
	channels: DrocsidChannel[];
	roles?: DrocsidRole[];
	users?: DrocsidGuildUser[];
};

export type DrocsidUser = {
	id: string;
	name: string;
	avatarLetter: string;
	status: DrocsidStatus;
};

export type DrocsidFriend = DrocsidUser;
