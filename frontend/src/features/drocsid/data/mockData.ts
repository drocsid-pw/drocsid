import type { DrocsidGuild, DrocsidMessage, DrocsidFriend, DrocsidUser } from "../types";

export const currentUser: DrocsidUser = {
	id: "user-1",
	name: "Rafał",
	avatarLetter: "R",
	avatarHash: "hash-user-1",
};

export const mockServers: DrocsidGuild[] = [
	{
		id: "server-1",
		name: "drocsid / server-1",
		icon: "🏡",
		ownerId: 1n,
		channels: [
			{
				id: "general",
				name: "general",
				guildId: 1n,
				messages: [
					{
						id: "m1",
						author: "Rafał",
						timestamp: "09:12",
						content: "Siemano, oceniajcie design",
						channelId: 1n,
					},
					{
						id: "m2",
						author: "Twój stary",
						timestamp: "09:13",
						content: "Ej, zajebisty drocsid",
						channelId: 1n,
					},
					{
						id: "m3",
						author: "Miron",
						timestamp: "09:15",
						content: "No i git. Kuba, rób elixira",
						channelId: 1n,
					},
				],
			},
			{
				id: "dev",
				name: "dev",
				guildId: 1n,
				messages: [
					{
						id: "m4",
						author: "Kuba",
						timestamp: "10:01",
						content: "Dodałem upload plików, przetestujcie",
						channelId: 2n,
					},
					{
						id: "m5",
						author: "Rafał",
						timestamp: "10:05",
						content: "Front podpięty pod nowy endpoint",
						channelId: 2n,
					},
				],
			},
			{
				id: "design",
				name: "design",
				guildId: 1n,
				messages: [
					{
						id: "m6",
						author: "Rafał",
						timestamp: "11:20",
						content: "Nowy layout sidebaru wrzucony do Figmy",
						channelId: 3n,
					},
				],
			},
			{
				id: "random",
				name: "random",
				guildId: 1n,
				messages: [
					{
						id: "m7",
						author: "Twój stary",
						timestamp: "12:00",
						content: "Miał być side project, a znowu wychodzi produkt",
						channelId: 4n,
					},
				],
			},
		],
	},
	{
		id: "server-2",
		name: "side-projecty",
		icon: "🧪",
		ownerId: 2n,
		channels: [
			{
				id: "ideas",
				name: "ideas",
				guildId: 2n,
				messages: [
					{
						id: "m8",
						author: "Rafał",
						timestamp: "14:10",
						content: "Zróbmy mini SaaS do boardów kanban jak w Discordzie",
						channelId: 5n,
					},
				],
			},
			{
				id: "build-in-public",
				name: "build-in-public",
				guildId: 2n,
				messages: [
					{
						id: "m9",
						author: "Rafał",
						timestamp: "14:30",
						content: "Dzień 1: działa logowanie Google i layout discorda",
						channelId: 6n,
					},
				],
			},
		],
	},
];

export const mockFriends: DrocsidFriend[] = [
	{
		id: "friend-1",
		name: "Kuba",
		avatarLetter: "K",
		avatarHash: "hash-friend-1",
	},
	{
		id: "friend-2",
		name: "Miron",
		avatarLetter: "M",
		avatarHash: "hash-friend-2",
	},
	{
		id: "friend-3",
		name: "Twój stary",
		avatarLetter: "T",
		avatarHash: "hash-friend-3",
	},
	{
		id: "friend-4",
		name: "Ania",
		avatarLetter: "A",
		avatarHash: "hash-friend-4",
	},
	{
		id: "friend-5",
		name: "Piotr",
		avatarLetter: "P",
		avatarHash: "hash-friend-5",
	},
];

export const mockFriendMessages: Record<string, DrocsidMessage[]> = {
	"friend-1": [
		{
			id: "dm1",
			author: "Kuba",
			timestamp: "09:00",
			content: "Zróbmy jeszcze voice chat kiedyś",
			channelId: 1001n,
		},
		{
			id: "dm2",
			author: "Rafał",
			timestamp: "09:02",
			content: "Najpierw tekst, potem reszta",
			channelId: 1001n,
		},
	],
	"friend-2": [
		{
			id: "dm3",
			author: "Miron",
			timestamp: "10:15",
			content: "Elixir backend jeszcze nie działa???",
			channelId: 1002n,
		},
	],
	"friend-3": [
		{
			id: "dm4",
			author: "Twój stary",
			timestamp: "11:11",
			content: "No i co z tym side projectem",
			channelId: 1003n,
		},
	],
	"friend-4": [
		{
			id: "dm5",
			author: "Ania",
			timestamp: "12:34",
			content: "Fajny ten layout pod discorda",
			channelId: 1004n,
		},
	],
	"friend-5": [
		{
			id: "dm6",
			author: "Piotr",
			timestamp: "13:37",
			content: "Jak coś, to testuję ten drocsid",
			channelId: 1005n,
		},
	],
};
