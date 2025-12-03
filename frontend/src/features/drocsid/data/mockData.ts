import type { DrocsidGuild, DrocsidMessage, DrocsidFriend, DrocsidUser } from "../types";

const RAFA_ID = 1n;
const KUBA_ID = 2n;
const MIRON_ID = 3n;
const TATA_ID = 4n;
const ANIA_ID = 5n;
const PIOTR_ID = 6n;

export const currentUser: DrocsidUser = {
	id: RAFA_ID,
	name: "Rafał",
	avatarLetter: "R",
	avatarHash: "hash-user-1",
};

export const mockServers: DrocsidGuild[] = [
	{
		id: 1n,
		name: "drocsid / server-1",
		icon: "🏡",
		ownerId: RAFA_ID,
		channels: [
			{
				id: 11n,
				name: "general",
				guildId: 1n,
				messages: [
					{
						id: 1n,
						authorId: RAFA_ID,
						authorName: "Rafał",
						timestamp: "09:12",
						content: "Siemano, oceniajcie design",
						channelId: 11n,
					},
					{
						id: 2n,
						authorId: TATA_ID,
						authorName: "Twój stary",
						timestamp: "09:13",
						content: "Ej, zajebisty drocsid",
						channelId: 11n,
					},
					{
						id: 3n,
						authorId: MIRON_ID,
						authorName: "Miron",
						timestamp: "09:15",
						content: "No i git. Kuba, rób elixira",
						channelId: 11n,
					},
				],
			},
			{
				id: 12n,
				name: "dev",
				guildId: 1n,
				messages: [
					{
						id: 4n,
						authorId: KUBA_ID,
						authorName: "Kuba",
						timestamp: "10:01",
						content: "Dodałem upload plików, przetestujcie",
						channelId: 12n,
					},
					{
						id: 5n,
						authorId: RAFA_ID,
						authorName: "Rafał",
						timestamp: "10:05",
						content: "Front podpięty pod nowy endpoint",
						channelId: 12n,
					},
				],
			},
			{
				id: 13n,
				name: "design",
				guildId: 1n,
				messages: [
					{
						id: 6n,
						authorId: RAFA_ID,
						authorName: "Rafał",
						timestamp: "11:20",
						content: "Nowy layout sidebaru wrzucony do Figmy",
						channelId: 13n,
					},
				],
			},
			{
				id: 14n,
				name: "random",
				guildId: 1n,
				messages: [
					{
						id: 7n,
						authorId: TATA_ID,
						authorName: "Twój stary",
						timestamp: "12:00",
						content: "Miał być side project, a znowu wychodzi produkt",
						channelId: 14n,
					},
				],
			},
		],
	},
	{
		id: 2n,
		name: "side-projecty",
		icon: "🧪",
		ownerId: KUBA_ID,
		channels: [
			{
				id: 21n,
				name: "ideas",
				guildId: 2n,
				messages: [
					{
						id: 8n,
						authorId: RAFA_ID,
						authorName: "Rafał",
						timestamp: "14:10",
						content: "Zróbmy mini SaaS do boardów kanban jak w Discordzie",
						channelId: 21n,
					},
				],
			},
			{
				id: 22n,
				name: "build-in-public",
				guildId: 2n,
				messages: [
					{
						id: 9n,
						authorId: RAFA_ID,
						authorName: "Rafał",
						timestamp: "14:30",
						content: "Dzień 1: działa logowanie Google i layout discorda",
						channelId: 22n,
					},
				],
			},
		],
	},
];

export const mockFriends: DrocsidFriend[] = [
	{
		id: KUBA_ID,
		name: "Kuba",
		avatarLetter: "K",
		avatarHash: "hash-friend-1",
	},
	{
		id: MIRON_ID,
		name: "Miron",
		avatarLetter: "M",
		avatarHash: "hash-friend-2",
	},
	{
		id: TATA_ID,
		name: "Twój stary",
		avatarLetter: "T",
		avatarHash: "hash-friend-3",
	},
	{
		id: ANIA_ID,
		name: "Ania",
		avatarLetter: "A",
		avatarHash: "hash-friend-4",
	},
	{
		id: PIOTR_ID,
		name: "Piotr",
		avatarLetter: "P",
		avatarHash: "hash-friend-5",
	},
];

export const mockFriendMessages: Record<string, DrocsidMessage[]> = {
	[String(KUBA_ID)]: [
		{
			id: 10001n,
			authorId: KUBA_ID,
			authorName: "Kuba",
			timestamp: "09:00",
			content: "Zróbmy jeszcze voice chat kiedyś",
			channelId: 1001n,
		},
		{
			id: 10002n,
			authorId: RAFA_ID,
			authorName: "Rafał",
			timestamp: "09:02",
			content: "Najpierw tekst, potem reszta",
			channelId: 1001n,
		},
	],
	[String(MIRON_ID)]: [
		{
			id: 10003n,
			authorId: MIRON_ID,
			authorName: "Miron",
			timestamp: "10:15",
			content: "Elixir backend jeszcze nie działa???",
			channelId: 1002n,
		},
	],
	[String(TATA_ID)]: [
		{
			id: 10004n,
			authorId: TATA_ID,
			authorName: "Twój stary",
			timestamp: "11:11",
			content: "No i co z tym side projectem",
			channelId: 1003n,
		},
	],
	[String(ANIA_ID)]: [
		{
			id: 10005n,
			authorId: ANIA_ID,
			authorName: "Ania",
			timestamp: "12:34",
			content: "Fajny ten layout pod discorda",
			channelId: 1004n,
		},
	],
	[String(PIOTR_ID)]: [
		{
			id: 10006n,
			authorId: PIOTR_ID,
			authorName: "Piotr",
			timestamp: "13:37",
			content: "Jak coś, to testuję ten drocsid",
			channelId: 1005n,
		},
	],
};
