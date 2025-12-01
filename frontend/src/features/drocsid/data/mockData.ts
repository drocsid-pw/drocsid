import type { DrocsidServer, DrocsidMessage, DrocsidFriend, DrocsidUser } from "../types";

export const currentUser: DrocsidUser = {
	id: "user-1",
	name: "Rafał",
	avatarLetter: "R",
	status: "online",
};

export const mockServers: DrocsidServer[] = [
	{
		id: "server-1",
		name: "drocsid / server-1",
		icon: "🏡",
		channels: [
			{
				id: "general",
				name: "general",
				type: "text",
				topic: "Ogólna rozmowa o projekcie",
				messages: [
					{
						id: "m1",
						user: "Rafał",
						time: "09:12",
						text: "Siemano, oceniajcie design",
					},
					{
						id: "m2",
						user: "Twój stary",
						time: "09:13",
						text: "Ej, zajebisty drocsid",
					},
					{
						id: "m3",
						user: "Miron",
						time: "09:15",
						text: "No i git. Kuba, rób elixira",
					},
				],
			},
			{
				id: "dev",
				name: "dev",
				type: "text",
				topic: "Programowanie, PRy, bugi",
				messages: [
					{
						id: "m4",
						user: "Kuba",
						time: "10:01",
						text: "Dodałem upload plików, przetestujcie",
					},
					{
						id: "m5",
						user: "Rafał",
						time: "10:05",
						text: "Front podpięty pod nowy endpoint",
					},
				],
			},
			{
				id: "design",
				name: "design",
				type: "text",
				topic: "UX, UI",
				messages: [
					{
						id: "m6",
						user: "Rafał",
						time: "11:20",
						text: "Nowy layout sidebaru wrzucony",
					},
				],
			},
			{
				id: "random",
				name: "random",
				type: "text",
				topic: "Memy i offtop",
				messages: [
					{
						id: "m7",
						user: "Twój stary",
						time: "12:00",
						text: "Miał być side project, a znowu wychodzi produkt",
					},
				],
			},
		],
	},
	{
		id: "server-2",
		name: "side-projecty",
		icon: "🧪",
		channels: [
			{
				id: "ideas",
				name: "ideas",
				type: "text",
				topic: "Pomysły na projekty",
				messages: [
					{
						id: "m8",
						user: "Rafał",
						time: "14:10",
						text: "Zróbmy mini SaaS do boardów kanban jak w Discordzie",
					},
				],
			},
			{
				id: "build-in-public",
				name: "build-in-public",
				type: "text",
				topic: "Dzienniczek progressu",
				messages: [
					{
						id: "m9",
						user: "Rafał",
						time: "14:30",
						text: "Dzień 1: działa logowanie Google i layout discorda",
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
		status: "online",
	},
	{
		id: "friend-2",
		name: "Miron",
		avatarLetter: "M",
		status: "online",
	},
	{
		id: "friend-3",
		name: "Twój stary",
		avatarLetter: "T",
		status: "idle",
	},
	{
		id: "friend-4",
		name: "Ania",
		avatarLetter: "A",
		status: "dnd",
	},
	{
		id: "friend-5",
		name: "Piotr",
		avatarLetter: "P",
		status: "offline",
	},
];

export const mockFriendMessages: Record<string, DrocsidMessage[]> = {
	"friend-1": [
		{
			id: "dm1",
			user: "Kuba",
			time: "09:00",
			text: "Zróbmy jeszcze voice chat kiedyś",
		},
		{
			id: "dm2",
			user: "Rafał",
			time: "09:02",
			text: "Najpierw tekst, potem reszta",
		},
	],
	"friend-2": [
		{
			id: "dm3",
			user: "Miron",
			time: "10:15",
			text: "Elixir backend jeszcze nie działa???",
		},
	],
	"friend-3": [
		{
			id: "dm4",
			user: "Twój stary",
			time: "11:11",
			text: "No i co z tym side projectem",
		},
	],
	"friend-4": [
		{
			id: "dm5",
			user: "Ania",
			time: "12:34",
			text: "Fajny ten layout pod discorda",
		},
	],
	"friend-5": [
		{
			id: "dm6",
			user: "Piotr",
			time: "13:37",
			text: "Jak coś, to testuję ten drocsid",
		},
	],
};
