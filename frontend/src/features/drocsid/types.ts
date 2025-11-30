export type DrocsidStatus = "online" | "idle" | "dnd" | "offline";

export type DrocsidMessage = {
	id: string;
	user: string;
	time: string;
	text: string;
};

export type DrocsidChannel = {
	id: string;
	name: string;
	type: "text";
	topic?: string;
	messages: DrocsidMessage[];
};

export type DrocsidServer = {
	id: string;
	name: string;
	icon: string;
	channels: DrocsidChannel[];
};

export type DrocsidUser = {
	id: string;
	name: string;
	avatarLetter: string;
	status: DrocsidStatus;
};

export type DrocsidFriend = DrocsidUser;
