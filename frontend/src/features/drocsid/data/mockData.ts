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
					{ id: "m1", user: "Rafał", time: "09:12", text: "Siemano, oceniajcie design" },
					{ id: "m2", user: "Twój stary", time: "09:13", text: "Ej, zajebisty drocsid" },
					{ id: "m3", user: "Miron", time: "09:15", text: "No i git. Kuba, rób elixira" },
				],
				overrides: [],
			},
			{
				id: 12n,
				name: "dev",
				guildId: 1n,
				messages: [
					{ id: "m4", user: "Kuba", time: "10:01", text: "Dodałem upload plików, przetestujcie" },
					{ id: "m5", user: "Rafał", time: "10:05", text: "Front podpięty pod nowy endpoint" },
				],
				overrides: [],
			},
			{
				id: 13n,
				name: "design",
				type: "text",
				topic: "UX, UI",
				messages: [{ id: "m6", user: "Rafał", time: "11:20", text: "Nowy layout sidebaru wrzucony" }],
				overrides: [],
			},
			{
				id: 14n,
				name: "random",
				type: "text",
				topic: "Memy i offtop",
				messages: [{ id: "m7", user: "Twój stary", time: "12:00", text: "Miał być side project, a znowu wychodzi produkt" }],
				overrides: [],
			},
		],
		roles: [
			{
				id: "server-1-role-owner",
				name: "@owner",
				permissions: ["MANAGE_GUILD_USERS", "MANAGE_CHANNEL", "ADMIN_DELETE_MESSAGES", "MANAGE_GUILD", "READ", "WRITE"],
				system: true,
			},
			{
				id: "server-1-role-everyone",
				name: "@everyone",
				permissions: ["READ", "WRITE"],
				system: true,
			},
			{
				id: "server-1-role-admin",
				name: "Admin",
				permissions: ["MANAGE_GUILD_USERS", "MANAGE_CHANNEL", "ADMIN_DELETE_MESSAGES", "MANAGE_GUILD", "READ", "WRITE"],
			},
			{
				id: "server-1-role-moderator",
				name: "Moderator",
				permissions: ["MANAGE_GUILD_USERS", "MANAGE_CHANNEL", "ADMIN_DELETE_MESSAGES", "READ", "WRITE"],
			},
		],
		users: [
			{ id: "server-1-user-1", nick: "Rafał", roleIds: ["server-1-role-owner", "server-1-role-admin", "server-1-role-everyone"] },
			{ id: "server-1-user-2", nick: "Kuba", roleIds: ["server-1-role-moderator", "server-1-role-everyone"] },
			{ id: "server-1-user-3", nick: "Miron", roleIds: ["server-1-role-everyone"] },
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
				type: "text",
				topic: "Pomysły na projekty",
				messages: [{ id: "m8", user: "Rafał", time: "14:10", text: "Zróbmy mini SaaS do boardów kanban jak w Discordzie" }],
				overrides: [],
			},
			{
				id: 22n,
				name: "build-in-public",
				type: "text",
				topic: "Dzienniczek progressu",
				messages: [{ id: "m9", user: "Rafał", time: "14:30", text: "Dzień 1: działa logowanie Google i layout discorda" }],
				overrides: [],
			},
		],
		roles: [
			{
				id: "server-2-role-owner",
				name: "@owner",
				permissions: ["MANAGE_GUILD_USERS", "MANAGE_CHANNEL", "ADMIN_DELETE_MESSAGES", "MANAGE_GUILD", "READ", "WRITE"],
				system: true,
			},
			{
				id: "server-2-role-everyone",
				name: "@everyone",
				permissions: ["READ", "WRITE"],
				system: true,
			},
			{
				id: "server-2-role-builder",
				name: "Builder",
				permissions: ["MANAGE_CHANNEL", "READ", "WRITE"],
			},
		],
		users: [
			{ id: "server-2-user-1", nick: "Rafał", roleIds: ["server-2-role-owner", "server-2-role-builder", "server-2-role-everyone"] },
			{ id: "server-2-user-2", nick: "Ania", roleIds: ["server-2-role-everyone"] },
		],
	},
];

export const mockFriends: DrocsidFriend[] = [
	{ id: "friend-1", name: "Kuba", avatarLetter: "K", status: "online" },
	{ id: "friend-2", name: "Miron", avatarLetter: "M", status: "online" },
	{ id: "friend-3", name: "Twój stary", avatarLetter: "T", status: "idle" },
	{ id: "friend-4", name: "Ania", avatarLetter: "A", status: "dnd" },
	{ id: "friend-5", name: "Piotr", avatarLetter: "P", status: "offline" },
];

export const mockFriendMessages: Record<string, DrocsidMessage[]> = {
	"friend-1": [
		{ id: "dm1", user: "Kuba", time: "09:00", text: "Zróbmy jeszcze voice chat kiedyś" },
		{ id: "dm2", user: "Rafał", time: "09:02", text: "Najpierw tekst, potem reszta" },
	],
	"friend-2": [{ id: "dm3", user: "Miron", time: "10:15", text: "Elixir backend jeszcze nie działa???" }],
	"friend-3": [{ id: "dm4", user: "Twój stary", time: "11:11", text: "No i co z tym side projectem" }],
	"friend-4": [{ id: "dm5", user: "Ania", time: "12:34", text: "Fajny ten layout pod discorda" }],
	"friend-5": [{ id: "dm6", user: "Piotr", time: "13:37", text: "Jak coś, to testuję ten drocsid" }],
};
