import { useMemo } from "react";
import { useAuth } from "../auth/auth";
import * as api from "./drocsidApi";

export function useDrocsidApi() {
	const { token, callerId } = useAuth();

	return useMemo(() => {
		if (!token || !callerId) {
			return null;
		}

		const auth: api.ApiAuth = { token };

		return {
			auth,

			getCurrentUser: () => api.getCurrentUser(auth),
			putUser: (userId: string, body: { name: string; avatarHash: string }) => api.putUser(auth, userId, body),
			deleteUser: (userId: string) => api.deleteUser(auth, userId),

			getAllGuilds: (userId: string) => api.getAllGuilds(auth, userId),
			createGuild: (body: { name: string; icon: string }) => api.createGuild(auth, body),
			getGuild: (guildId: string) => api.getGuild(auth, guildId),
			putGuild: (guildId: string, guild: api.GuildBody) => api.putGuild(auth, guildId, guild),
			deleteGuild: (guildId: string) => api.deleteGuild(auth, guildId),

			getAllChannels: (guildId: string) => api.getAllChannels(auth, guildId),
			createChannel: (guildId: string, name: string) => api.createChannel(auth, guildId, { name }),
			getChannel: (channelId: string) => api.getChannel(auth, channelId),
			putChannel: (channelId: string, channel: api.PutChannel) => api.putChannel(auth, channelId, channel),
			deleteChannel: (channelId: string) => api.deleteChannel(auth, channelId),

			getRoles: (guildId: string) => api.getRoles(auth, guildId),
			getRole: (guildId: string, guildRoleId: string) => api.getRole(auth, guildId, guildRoleId),
			createRole: (guildId: string, body: { roleName: string; permissions: string }) => api.createRole(auth, guildId, body),
			putRole: (guildId: string, guildRoleId: string, body: { roleName: string; permissions: string }) => api.putRole(auth, guildId, guildRoleId, body),

			addUserToGuild: (guildId: string) => api.addUserToGuild(auth, guildId),
			getGuildUsers: (guildId: string) => api.getGuildUsers(auth, guildId),
			getGuildUser: (guildId: string, guildUserId: string) => api.getGuildUser(auth, guildId, guildUserId),
			putGuildUser: (guildId: string, guildUserId: string, body: api.GuildUserBody) => api.putGuildUser(auth, guildId, guildUserId, body),
			deleteGuildUser: (guildId: string, guildUserId: string) => api.deleteGuildUser(auth, guildId, guildUserId),

			getMessages: (channelId: string, offset = 0, count = 50) => api.getMessages(auth, channelId, { offset, count }),
			createMessage: (channelId: string, content: string) => api.createMessage(auth, channelId, { content }),
			deleteMessage: (channelId: string, messageId: string) => api.deleteMessage(auth, channelId, messageId),

			uploadImage: (file: string, filename: string) => api.uploadImage(auth, { file, filename }),
		};
	}, [token, callerId]);
}
