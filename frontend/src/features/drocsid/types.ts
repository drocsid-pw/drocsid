export type DrocsidStatus = "online" | "idle" | "dnd" | "offline";

export type DrocsidMessage = {
	id: bigint;
	authorId: bigint;
	authorName: string;
	timestamp: string;
	content: string;
	channelId: bigint;
};

export type DrocsidChannel = {
	id: bigint;
	name: string;
	messages: DrocsidMessage[];
	guildId: bigint;
};

export type DrocsidGuild = {
	id: bigint;
	name: string;
	icon: string;
	ownerId: bigint;
	channels: DrocsidChannel[];
};

export type DrocsidUser = {
	id: bigint;
	name: string;
	avatarLetter: string;
	avatarHash: string;
};

export type DrocsidFriend = DrocsidUser;
