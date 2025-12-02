export type DrocsidStatus = "online" | "idle" | "dnd" | "offline";

export type DrocsidMessage = {
	id: string;
	author: string;
	timestamp: string;
	content: string;
	channelId: bigint;
};

export type DrocsidChannel = {
	id: string;
	name: string;
	messages: DrocsidMessage[];
	guildId: bigint;
};

export type DrocsidGuild = {
	id: string;
	name: string;
	icon: string;
	ownerId: bigint;
	channels: DrocsidChannel[];
};

export type DrocsidUser = {
	id: string;
	name: string;
	avatarLetter: string;
	avatarHash: string;
};

export type DrocsidFriend = DrocsidUser;
