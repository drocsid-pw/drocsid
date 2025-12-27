// ./frontend/src/api/drocsidApi.ts
import { requestJson } from "./http";

export type Nullable<T> = T | null;

export type UserDto = {
	id: Nullable<string>;
	name: Nullable<string>;
	avatarHash: Nullable<string>;
};

export type RoleDto = {
	guildRoleId: Nullable<string>;
	roleName: Nullable<string>;
	permissions: Nullable<string>;
};

export type RoleListDto = {
	roles: RoleDto[] | null;
};

export type GuildDto = {
	guildId: Nullable<string>;
	name: Nullable<string>;
	icon: Nullable<string>;
	ownerId: Nullable<string>;
	roles: RoleDto[] | null;
};

export type GuildListDto = {
	guilds: GuildDto[] | null;
};

export type ChannelDto = {
	channelId: Nullable<string>;
	name: Nullable<string>;
	guildId: Nullable<string>;
	overrides: RoleListDto | null;
};

export type ChannelListDto = {
	channels: ChannelDto[] | null;
};

export type GuildUserDto = {
	guildUserId: Nullable<string>;
	nick: Nullable<string>;
	roles: RoleListDto | null;
};

export type GuildUserListDto = {
	guildUsers: GuildUserDto[] | null;
};

export type MessageDto = {
	messageId: Nullable<string>;
	author: GuildUserDto | null;
	content: Nullable<string>;
	timestamp?: Nullable<string>;
};

export type MessageListDto = {
	messages: MessageDto[] | null;
};

export type ResponseMessageDto = {
	text: Nullable<string>;
};

export type ImageDto = {
	url?: Nullable<string>;
	hash?: Nullable<string>;
	filename?: Nullable<string>;
};

export type ApiAuth = {
	token: string;
	callerId: string;
};

export type GuildBody = {
	guildId?: string;
	name: string;
	icon: string;
	ownerId?: string;
	roles?: RoleDto[];
};

export type PutChannel = {
	name: string;
	guildId?: string;
	overrides?: RoleListDto;
};

export type GuildUserBody = {
	guildUserId?: string;
	nick: string;
	roles: RoleDto[] | RoleListDto | unknown;
};

const EMPTY_GUILD_LIST: GuildListDto = { guilds: [] };
const EMPTY_CHANNEL_LIST: ChannelListDto = { channels: [] };
const EMPTY_ROLE_LIST: RoleListDto = { roles: [] };
const EMPTY_GUILD_USER_LIST: GuildUserListDto = { guildUsers: [] };
const EMPTY_MESSAGE_LIST: MessageListDto = { messages: [] };

function withCallerQuery(auth: ApiAuth, query?: Record<string, string | number | boolean | null | undefined>) {
	return { ...(query ?? {}), caller_id: auth.callerId };
}

function withCallerBody(auth: ApiAuth, body?: Record<string, unknown>) {
	return { ...(body ?? {}), caller_id: auth.callerId };
}

export async function createUser(auth: ApiAuth, body: { name: string }): Promise<UserDto> {
	return requestJson<UserDto>({
		method: "POST",
		path: "/users",
		token: auth.token,
		body: withCallerBody(auth, body),
	});
}

/**
 * Backend: GET /api/users/get_user
 * User jest brany z Authorization headera.
 */
export async function getCurrentUser(auth: ApiAuth): Promise<UserDto> {
	return requestJson<UserDto>({
		method: "GET",
		path: "/users/get_user",
		token: auth.token,
	});
}

export async function putUser(auth: ApiAuth, userId: string, body: { name: string; avatarHash: string }): Promise<UserDto> {
	return requestJson<UserDto>({
		method: "PUT",
		path: `/users/${userId}`,
		token: auth.token,
		body: withCallerBody(auth, {
			name: body.name,
			avatarHash: body.avatarHash,
		}),
	});
}

export async function deleteUser(auth: ApiAuth, userId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/users/${userId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function getAllGuilds(auth: ApiAuth, userId: string): Promise<GuildListDto> {
	return requestJson<GuildListDto>({
		method: "GET",
		path: `/users/${userId}/guilds`,
		token: auth.token,
		query: withCallerQuery(auth),
		nullFallback: EMPTY_GUILD_LIST,
	});
}

export async function createGuild(auth: ApiAuth, body: { name: string; icon: string }): Promise<GuildDto> {
	return requestJson<GuildDto>({
		method: "POST",
		path: "/guilds",
		token: auth.token,
		body: withCallerBody(auth, {
			name: body.name,
			icon: body.icon,
		}),
	});
}

export async function getGuild(auth: ApiAuth, guildId: string): Promise<GuildDto> {
	return requestJson<GuildDto>({
		method: "GET",
		path: `/guilds/${guildId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function putGuild(auth: ApiAuth, guildId: string, guild: GuildBody): Promise<GuildDto> {
	return requestJson<GuildDto>({
		method: "PUT",
		path: `/guilds/${guildId}`,
		token: auth.token,
		body: withCallerBody(auth, { guild }),
	});
}

export async function deleteGuild(auth: ApiAuth, guildId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/guilds/${guildId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function getAllChannels(auth: ApiAuth, guildId: string): Promise<ChannelListDto> {
	return requestJson<ChannelListDto>({
		method: "GET",
		path: `/guilds/${guildId}/channels`,
		token: auth.token,
		query: withCallerQuery(auth),
		nullFallback: EMPTY_CHANNEL_LIST,
	});
}

export async function createChannel(auth: ApiAuth, guildId: string, body: { name: string }): Promise<ChannelDto> {
	return requestJson<ChannelDto>({
		method: "POST",
		path: `/guilds/${guildId}/channels`,
		token: auth.token,
		body: withCallerBody(auth, { name: body.name }),
	});
}

export async function getRoles(auth: ApiAuth, guildId: string): Promise<RoleListDto> {
	return requestJson<RoleListDto>({
		method: "GET",
		path: `/guilds/${guildId}/roles`,
		token: auth.token,
		query: withCallerQuery(auth),
		nullFallback: EMPTY_ROLE_LIST,
	});
}

export async function getRole(auth: ApiAuth, guildId: string, guildRoleId: string): Promise<RoleDto> {
	return requestJson<RoleDto>({
		method: "GET",
		path: `/guilds/${guildId}/roles/${guildRoleId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function createRole(auth: ApiAuth, guildId: string, body: { roleName: string; permissions: string }): Promise<RoleDto> {
	return requestJson<RoleDto>({
		method: "POST",
		path: `/guilds/${guildId}/roles`,
		token: auth.token,
		body: withCallerBody(auth, {
			roleName: body.roleName,
			permissions: body.permissions,
		}),
	});
}

export async function putRole(auth: ApiAuth, guildId: string, guildRoleId: string, body: { roleName: string; permissions: string }): Promise<RoleDto> {
	return requestJson<RoleDto>({
		method: "PUT",
		path: `/guilds/${guildId}/roles/${guildRoleId}`,
		token: auth.token,
		body: withCallerBody(auth, {
			role: {
				roleName: body.roleName,
				permissions: body.permissions,
			},
		}),
	});
}

export async function addUserToGuild(auth: ApiAuth, guildId: string): Promise<GuildUserDto> {
	return requestJson<GuildUserDto>({
		method: "POST",
		path: `/guilds/${guildId}/users`,
		token: auth.token,
		body: withCallerBody(auth),
	});
}

export async function getGuildUsers(auth: ApiAuth, guildId: string): Promise<GuildUserListDto> {
	return requestJson<GuildUserListDto>({
		method: "GET",
		path: `/guilds/${guildId}/users`,
		token: auth.token,
		query: withCallerQuery(auth),
		nullFallback: EMPTY_GUILD_USER_LIST,
	});
}

export async function getGuildUser(auth: ApiAuth, guildId: string, guildUserId: string): Promise<GuildUserDto> {
	return requestJson<GuildUserDto>({
		method: "GET",
		path: `/guilds/${guildId}/users/${guildUserId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function putGuildUser(auth: ApiAuth, guildId: string, guildUserId: string, user: GuildUserBody): Promise<GuildUserDto> {
	return requestJson<GuildUserDto>({
		method: "PUT",
		path: `/guilds/${guildId}/users/${guildUserId}`,
		token: auth.token,
		body: withCallerBody(auth, { user }),
	});
}

export async function deleteGuildUser(auth: ApiAuth, guildId: string, guildUserId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/guilds/${guildId}/users/${guildUserId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function getChannel(auth: ApiAuth, channelId: string): Promise<ChannelDto> {
	return requestJson<ChannelDto>({
		method: "GET",
		path: `/channels/${channelId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function putChannel(auth: ApiAuth, channelId: string, channel: PutChannel): Promise<ChannelDto> {
	return requestJson<ChannelDto>({
		method: "PUT",
		path: `/channels/${channelId}`,
		token: auth.token,
		body: withCallerBody(auth, { channel }),
	});
}

export async function deleteChannel(auth: ApiAuth, channelId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/channels/${channelId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function getMessages(auth: ApiAuth, channelId: string, args: { offset: number; count: number }): Promise<MessageListDto> {
	return requestJson<MessageListDto>({
		method: "GET",
		path: `/channels/${channelId}/messages`,
		token: auth.token,
		query: withCallerQuery(auth, {
			offset: args.offset,
			count: args.count,
		}),
		nullFallback: EMPTY_MESSAGE_LIST,
	});
}

export async function createMessage(auth: ApiAuth, channelId: string, body: { content: string }): Promise<MessageDto> {
	return requestJson<MessageDto>({
		method: "POST",
		path: `/channels/${channelId}/messages`,
		token: auth.token,
		body: withCallerBody(auth, {
			message: { content: body.content },
		}),
	});
}

export async function deleteMessage(auth: ApiAuth, channelId: string, messageId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/channels/${channelId}/messages/${messageId}`,
		token: auth.token,
		query: withCallerQuery(auth),
	});
}

export async function uploadImage(auth: ApiAuth, body: { file: string; filename: string }): Promise<ImageDto> {
	return requestJson<ImageDto>({
		method: "POST",
		path: "/media/uploadImage",
		token: auth.token,
		body: withCallerBody(auth, body),
	});
}

export async function hello(body: { name: string }): Promise<{ message: string }> {
	return requestJson<{ message: string }>({
		method: "POST",
		path: "/hello",
		body,
	});
}
