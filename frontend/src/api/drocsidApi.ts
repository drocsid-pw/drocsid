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
};

export type MessageListDto = {
	messages: MessageDto[] | null;
};

export type ResponseMessageDto = {
	text: Nullable<string>;
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
	roles: RoleDto[] | RoleListDto;
};

export async function createUser(auth: ApiAuth, body: { name: string }): Promise<UserDto> {
	return requestJson<UserDto>({
		method: "POST",
		path: "/users",
		token: auth.token,
		body,
	});
}

export async function getUser(auth: ApiAuth, userId: string): Promise<UserDto> {
	return requestJson<UserDto>({
		method: "GET",
		path: `/users/${userId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function putUser(auth: ApiAuth, userId: string, body: { name: string; avatarHash: string }): Promise<UserDto> {
	return requestJson<UserDto>({
		method: "PUT",
		path: `/users/${userId}`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			name: body.name,
			avatarHash: body.avatarHash,
		},
	});
}

export async function deleteUser(auth: ApiAuth, userId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/users/${userId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function getAllGuilds(auth: ApiAuth, userId: string): Promise<GuildListDto> {
	return requestJson<GuildListDto>({
		method: "GET",
		path: `/users/${userId}/guilds`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function createGuild(auth: ApiAuth, body: { name: string; icon: string }): Promise<GuildDto> {
	return requestJson<GuildDto>({
		method: "POST",
		path: "/guilds",
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			name: body.name,
			icon: body.icon,
		},
	});
}

export async function getGuild(auth: ApiAuth, guildId: string): Promise<GuildDto> {
	return requestJson<GuildDto>({
		method: "GET",
		path: `/guilds/${guildId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function putGuild(auth: ApiAuth, guildId: string, guild: GuildBody): Promise<GuildDto> {
	return requestJson<GuildDto>({
		method: "PUT",
		path: `/guilds/${guildId}`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			guild,
		},
	});
}

export async function deleteGuild(auth: ApiAuth, guildId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/guilds/${guildId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function getAllChannels(auth: ApiAuth, guildId: string): Promise<ChannelListDto> {
	return requestJson<ChannelListDto>({
		method: "GET",
		path: `/guilds/${guildId}/channels`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function createChannel(auth: ApiAuth, guildId: string, body: { name: string }): Promise<ChannelDto> {
	return requestJson<ChannelDto>({
		method: "POST",
		path: `/guilds/${guildId}/channels`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			name: body.name,
		},
	});
}

export async function getRoles(auth: ApiAuth, guildId: string): Promise<RoleListDto> {
	return requestJson<RoleListDto>({
		method: "GET",
		path: `/guilds/${guildId}/roles`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function getRole(auth: ApiAuth, guildId: string, guildRoleId: string): Promise<RoleDto> {
	return requestJson<RoleDto>({
		method: "GET",
		path: `/guilds/${guildId}/roles/${guildRoleId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function createRole(auth: ApiAuth, guildId: string, body: { roleName: string; permissions: string }): Promise<RoleDto> {
	return requestJson<RoleDto>({
		method: "POST",
		path: `/guilds/${guildId}/roles`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			roleName: body.roleName,
			permissions: body.permissions,
		},
	});
}

export async function putRole(auth: ApiAuth, guildId: string, guildRoleId: string, body: { roleName: string; permissions: string }): Promise<RoleDto> {
	return requestJson<RoleDto>({
		method: "PUT",
		path: `/guilds/${guildId}/roles/${guildRoleId}`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			role: {
				roleName: body.roleName,
				permissions: body.permissions,
			},
		},
	});
}

export async function addUserToGuild(auth: ApiAuth, guildId: string): Promise<GuildUserDto> {
	return requestJson<GuildUserDto>({
		method: "POST",
		path: `/guilds/${guildId}/users`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
		},
	});
}

export async function getGuildUsers(auth: ApiAuth, guildId: string): Promise<GuildUserListDto> {
	return requestJson<GuildUserListDto>({
		method: "GET",
		path: `/guilds/${guildId}/users`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function getGuildUser(auth: ApiAuth, guildId: string, guildUserId: string): Promise<GuildUserDto> {
	return requestJson<GuildUserDto>({
		method: "GET",
		path: `/guilds/${guildId}/users/${guildUserId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function putGuildUser(auth: ApiAuth, guildId: string, guildUserId: string, user: GuildUserBody): Promise<GuildUserDto> {
	return requestJson<GuildUserDto>({
		method: "PUT",
		path: `/guilds/${guildId}/users/${guildUserId}`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			user,
		},
	});
}

export async function deleteGuildUser(auth: ApiAuth, guildId: string, guildUserId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/guilds/${guildId}/users/${guildUserId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function getChannel(auth: ApiAuth, channelId: string): Promise<ChannelDto> {
	return requestJson<ChannelDto>({
		method: "GET",
		path: `/channels/${channelId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function putChannel(auth: ApiAuth, channelId: string, channel: PutChannel): Promise<ChannelDto> {
	return requestJson<ChannelDto>({
		method: "PUT",
		path: `/channels/${channelId}`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			channel,
		},
	});
}

export async function deleteChannel(auth: ApiAuth, channelId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/channels/${channelId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}

export async function getMessages(auth: ApiAuth, channelId: string, args: { offset: number; count: number }): Promise<MessageListDto> {
	return requestJson<MessageListDto>({
		method: "GET",
		path: `/channels/${channelId}/messages`,
		token: auth.token,
		query: {
			caller_id: auth.callerId,
			offset: args.offset,
			count: args.count,
		},
	});
}

export async function createMessage(auth: ApiAuth, channelId: string, body: { content: string }): Promise<MessageDto> {
	return requestJson<MessageDto>({
		method: "POST",
		path: `/channels/${channelId}/messages`,
		token: auth.token,
		body: {
			caller_id: auth.callerId,
			message: {
				content: body.content,
			},
		},
	});
}

export async function deleteMessage(auth: ApiAuth, channelId: string, messageId: string): Promise<ResponseMessageDto> {
	return requestJson<ResponseMessageDto>({
		method: "DELETE",
		path: `/channels/${channelId}/messages/${messageId}`,
		token: auth.token,
		query: { caller_id: auth.callerId },
	});
}
