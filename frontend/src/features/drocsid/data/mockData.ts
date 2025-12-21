import type { DrocsidFriend, DrocsidGuild, DrocsidGuildUser, DrocsidMessage, DrocsidRole, DrocsidUser } from "../types";

export const currentUser: DrocsidUser = {
	id: "user-1",
	name: "Rafał",
	avatarLetter: "R",
	avatarHash: "hash-user-1",
};

function role(guildRoleId: string, roleName: string, permissions: string, system?: boolean): DrocsidRole {
	return { guildRoleId, roleName, permissions, system };
}

function user(guildUserId: string, nick: string, roles: DrocsidRole[]): DrocsidGuildUser {
	return {
		guildUserId,
		nick,
		roles: { roles },
	};
}

function msg(messageId: string, author: DrocsidGuildUser, timestamp: string, content: string): DrocsidMessage {
	return { messageId, author, timestamp, content };
}

const server1Roles: DrocsidRole[] = [
	role("server-1-role-owner", "@owner", "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|MANAGE_GUILD|READ|WRITE", true),
	role("server-1-role-everyone", "@everyone", "READ|WRITE", true),
	role("server-1-role-admin", "Admin", "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|MANAGE_GUILD|READ|WRITE"),
	role("server-1-role-moderator", "Moderator", "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|READ|WRITE"),
];

const server1UserRafal = user("server-1-user-1", "Rafał", [server1Roles[0], server1Roles[2], server1Roles[1]]);
const server1UserKuba = user("server-1-user-2", "Kuba", [server1Roles[3], server1Roles[1]]);
const server1UserMiron = user("server-1-user-3", "Miron", [server1Roles[1]]);

const server2Roles: DrocsidRole[] = [
	role("server-2-role-owner", "@owner", "MANAGE_GUILD_USERS|MANAGE_CHANNEL|ADMIN_DELETE_MESSAGES|MANAGE_GUILD|READ|WRITE", true),
	role("server-2-role-everyone", "@everyone", "READ|WRITE", true),
	role("server-2-role-builder", "Builder", "MANAGE_CHANNEL|READ|WRITE"),
];

const server2UserRafal = user("server-2-user-1", "Rafał", [server2Roles[0], server2Roles[2], server2Roles[1]]);
const server2UserAnia = user("server-2-user-2", "Ania", [server2Roles[1]]);

export const mockServers: DrocsidGuild[] = [
	{
		guildId: "server-1",
		name: "drocsid / server-1",
		icon: "🏡",
		ownerId: "user-1",
		roles: server1Roles,
		users: [server1UserRafal, server1UserKuba, server1UserMiron],
		channels: [
			{
				channelId: "11",
				name: "general",
				guildId: "server-1",
				overrides: { roles: [] },
				messages: [
					msg("m1", server1UserRafal, "09:12", "Siemano, oceniajcie design"),
					msg("m2", user("server-1-user-4", "Twój stary", []), "09:13", "Ej, zajebisty drocsid"),
					msg("m3", server1UserMiron, "09:15", "No i git. Kuba, rób elixira"),
				],
			},
			{
				channelId: "12",
				name: "dev",
				guildId: "server-1",
				overrides: { roles: [] },
				messages: [msg("m4", server1UserKuba, "10:01", "Dodałem upload plików, przetestujcie"), msg("m5", server1UserRafal, "10:05", "Front podpięty pod nowy endpoint")],
			},
			{
				channelId: "13",
				name: "design",
				guildId: "server-1",
				overrides: { roles: [] },
				messages: [msg("m6", server1UserRafal, "11:20", "Nowy layout sidebaru wrzucony")],
			},
			{
				channelId: "14",
				name: "random",
				guildId: "server-1",
				overrides: { roles: [] },
				messages: [msg("m7", user("server-1-user-4", "Twój stary", []), "12:00", "Miał być side project, a znowu wychodzi produkt")],
			},
		],
	},
	{
		guildId: "server-2",
		name: "side-projecty",
		icon: "🧪",
		ownerId: "user-2",
		roles: server2Roles,
		users: [server2UserRafal, server2UserAnia],
		channels: [
			{
				channelId: "21",
				name: "ideas",
				guildId: "server-2",
				overrides: { roles: [] },
				messages: [msg("m8", server2UserRafal, "14:10", "Zróbmy mini SaaS do boardów kanban jak w Discordzie")],
			},
			{
				channelId: "22",
				name: "build-in-public",
				guildId: "server-2",
				overrides: { roles: [] },
				messages: [msg("m9", server2UserRafal, "14:30", "Dzień 1: działa logowanie Google i layout discorda")],
			},
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
		{ messageId: "dm1", author: { guildUserId: "dm-kuba", nick: "Kuba", roles: { roles: [] } }, timestamp: "09:00", content: "Zróbmy jeszcze voice chat kiedyś" },
		{ messageId: "dm2", author: { guildUserId: "dm-rafal", nick: "Rafał", roles: { roles: [] } }, timestamp: "09:02", content: "Najpierw tekst, potem reszta" },
	],
	"friend-2": [{ messageId: "dm3", author: { guildUserId: "dm-miron", nick: "Miron", roles: { roles: [] } }, timestamp: "10:15", content: "Elixir backend jeszcze nie działa???" }],
	"friend-3": [{ messageId: "dm4", author: { guildUserId: "dm-tata", nick: "Twój stary", roles: { roles: [] } }, timestamp: "11:11", content: "No i co z tym side projectem" }],
	"friend-4": [{ messageId: "dm5", author: { guildUserId: "dm-ania", nick: "Ania", roles: { roles: [] } }, timestamp: "12:34", content: "Fajny ten layout pod discorda" }],
	"friend-5": [{ messageId: "dm6", author: { guildUserId: "dm-piotr", nick: "Piotr", roles: { roles: [] } }, timestamp: "13:37", content: "Jak coś, to testuję ten drocsid" }],
};
