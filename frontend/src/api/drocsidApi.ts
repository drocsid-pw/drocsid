import { requestJson, type Query } from "./http";

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

function withCallerQuery(auth: ApiAuth, query?: Query): Query {
	return { ...(query ?? {}), caller_id: auth.callerId };
}

function authedRequest<T>(
	auth: ApiAuth,
	args: { method: "GET" | "POST" | "PUT" | "DELETE"; path: string; query?: Query; body?: unknown; nullFallback?: T }
): Promise<T> {
	/**
	 * Wrapper for requestJson:
	 * - always adds auth.token to json
	 * - always appends caller_id in querystring
	 * - allows setting nullFallback for listing endpoints
	 */
	return requestJson<T>({
		method: args.method,
		path: args.path,
		token: auth.token,
		query: withCallerQuery(auth, args.query),
		body: args.body,
		nullFallback: args.nullFallback,
	});
}

async function authedGet<T>(auth: ApiAuth, path: string, args?: { query?: Query; nullFallback?: T }): Promise<T> {
	return authedRequest<T>(auth, { method: "GET", path, query: args?.query, nullFallback: args?.nullFallback });
}

async function authedPost<T>(auth: ApiAuth, path: string, args?: { query?: Query; body?: unknown; nullFallback?: T }): Promise<T> {
	return authedRequest<T>(auth, { method: "POST", path, query: args?.query, body: args?.body, nullFallback: args?.nullFallback });
}

async function authedPut<T>(auth: ApiAuth, path: string, args?: { query?: Query; body?: unknown; nullFallback?: T }): Promise<T> {
	return authedRequest<T>(auth, { method: "PUT", path, query: args?.query, body: args?.body, nullFallback: args?.nullFallback });
}

async function authedDelete<T>(auth: ApiAuth, path: string, args?: { query?: Query; nullFallback?: T }): Promise<T> {
	return authedRequest<T>(auth, { method: "DELETE", path, query: args?.query, nullFallback: args?.nullFallback });
}

/// USERS
export async function createUser(auth: ApiAuth, body: { name: string }): Promise<UserDto> {
	return authedPost<UserDto>(auth, "/users", { body });
}

export async function getCurrentUser(auth: ApiAuth): Promise<UserDto> {
	return authedGet<UserDto>(auth, "/users/get_user");
}

export async function putUser(auth: ApiAuth, userId: string, body: { name: string; avatarHash: string }): Promise<UserDto> {
	return authedPut<UserDto>(auth, `/users/${userId}`, {
		body: { name: body.name, avatarHash: body.avatarHash },
	});
}

export async function deleteUser(auth: ApiAuth, userId: string): Promise<ResponseMessageDto> {
	return authedDelete<ResponseMessageDto>(auth, `/users/${userId}`);
}

/// GUILDS
export async function getAllGuilds(auth: ApiAuth, userId: string): Promise<GuildListDto> {
	return authedGet<GuildListDto>(auth, `/users/${userId}/guilds`, { nullFallback: EMPTY_GUILD_LIST });
}

export async function createGuild(auth: ApiAuth, body: { name: string; icon: string }): Promise<GuildDto> {
	return authedPost<GuildDto>(auth, "/guilds", {
		body: { name: body.name, icon: body.icon },
	});
}

export async function getGuild(auth: ApiAuth, guildId: string): Promise<GuildDto> {
	return authedGet<GuildDto>(auth, `/guilds/${guildId}`);
}

export async function putGuild(auth: ApiAuth, guildId: string, guild: GuildBody): Promise<GuildDto> {
	return authedPut<GuildDto>(auth, `/guilds/${guildId}`, { body: { guild } });
}

export async function deleteGuild(auth: ApiAuth, guildId: string): Promise<ResponseMessageDto> {
	return authedDelete<ResponseMessageDto>(auth, `/guilds/${guildId}`);
}

/// CHANNELS
export async function getAllChannels(auth: ApiAuth, guildId: string): Promise<ChannelListDto> {
	return authedGet<ChannelListDto>(auth, `/guilds/${guildId}/channels`, { nullFallback: EMPTY_CHANNEL_LIST });
}

export async function createChannel(auth: ApiAuth, guildId: string, body: { name: string }): Promise<ChannelDto> {
	return authedPost<ChannelDto>(auth, `/guilds/${guildId}/channels`, { body: { name: body.name } });
}

export async function getChannel(auth: ApiAuth, channelId: string): Promise<ChannelDto> {
	return authedGet<ChannelDto>(auth, `/channels/${channelId}`);
}

export async function putChannel(auth: ApiAuth, channelId: string, channel: PutChannel): Promise<ChannelDto> {
	return authedPut<ChannelDto>(auth, `/channels/${channelId}`, { body: { channel } });
}

export async function deleteChannel(auth: ApiAuth, channelId: string): Promise<ResponseMessageDto> {
	return authedDelete<ResponseMessageDto>(auth, `/channels/${channelId}`);
}

/// ROLES
export async function getRoles(auth: ApiAuth, guildId: string): Promise<RoleListDto> {
	return authedGet<RoleListDto>(auth, `/guilds/${guildId}/roles`, { nullFallback: EMPTY_ROLE_LIST });
}

export async function getRole(auth: ApiAuth, guildId: string, guildRoleId: string): Promise<RoleDto> {
	return authedGet<RoleDto>(auth, `/guilds/${guildId}/roles/${guildRoleId}`);
}

export async function createRole(auth: ApiAuth, guildId: string, body: { roleName: string; permissions: string }): Promise<RoleDto> {
	return authedPost<RoleDto>(auth, `/guilds/${guildId}/roles`, {
		body: { roleName: body.roleName, permissions: body.permissions },
	});
}

export async function putRole(auth: ApiAuth, guildId: string, guildRoleId: string, body: { roleName: string; permissions: string }): Promise<RoleDto> {
	return authedPut<RoleDto>(auth, `/guilds/${guildId}/roles/${guildRoleId}`, {
		body: { role: { roleName: body.roleName, permissions: body.permissions } },
	});
}

/// GUILD USERS
export async function addUserToGuild(auth: ApiAuth, guildId: string): Promise<GuildUserDto> {
	return authedPost<GuildUserDto>(auth, `/guilds/${guildId}/users`, { body: {} });
}

export async function getGuildUsers(auth: ApiAuth, guildId: string): Promise<GuildUserListDto> {
	return authedGet<GuildUserListDto>(auth, `/guilds/${guildId}/users`, { nullFallback: EMPTY_GUILD_USER_LIST });
}

export async function getGuildUser(auth: ApiAuth, guildId: string, guildUserId: string): Promise<GuildUserDto> {
	return authedGet<GuildUserDto>(auth, `/guilds/${guildId}/users/${guildUserId}`);
}

export async function putGuildUser(auth: ApiAuth, guildId: string, guildUserId: string, user: GuildUserBody): Promise<GuildUserDto> {
	return authedPut<GuildUserDto>(auth, `/guilds/${guildId}/users/${guildUserId}`, { body: { user } });
}

export async function deleteGuildUser(auth: ApiAuth, guildId: string, guildUserId: string): Promise<ResponseMessageDto> {
	return authedDelete<ResponseMessageDto>(auth, `/guilds/${guildId}/users/${guildUserId}`);
}

/// MESSAGES
export async function getMessages(auth: ApiAuth, channelId: string, args: { offset: number; count: number }): Promise<MessageListDto> {
	return authedGet<MessageListDto>(auth, `/channels/${channelId}/messages`, {
		query: { offset: args.offset, count: args.count },
		nullFallback: EMPTY_MESSAGE_LIST,
	});
}

export async function createMessage(auth: ApiAuth, channelId: string, body: { content: string }): Promise<MessageDto> {
	return authedPost<MessageDto>(auth, `/channels/${channelId}/messages`, { body: { message: { content: body.content } } });
}

export async function deleteMessage(auth: ApiAuth, channelId: string, messageId: string): Promise<ResponseMessageDto> {
	return authedDelete<ResponseMessageDto>(auth, `/channels/${channelId}/messages/${messageId}`);
}

/// MEDIA
export async function uploadImage(auth: ApiAuth, body: { file: string; filename: string }): Promise<ImageDto> {
	return authedPost<ImageDto>(auth, "/media/uploadImage", { body });
}

/// MISC
export async function hello(body: { name: string }): Promise<{ message: string }> {
	return requestJson<{ message: string }>({
		method: "POST",
		path: "/hello",
		body,
	});
}
