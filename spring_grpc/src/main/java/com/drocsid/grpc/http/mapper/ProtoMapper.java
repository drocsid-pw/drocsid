package com.drocsid.grpc.http.mapper;

import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.proto.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public final class ProtoMapper {

    private ProtoMapper() {}

    public static UserDto toDto(User user) {
        if (user == null) {
            return new UserDto(null, null, null);
        }

        return new UserDto(
            user.getId(),
            user.getName(),
            user.getAvatarHash()
        );
    }

    public static RoleDto toDto(Role role) {
        if (role == null) {
            return new RoleDto(null, null, null);
        }

        return new RoleDto(
            role.getGuildRoleId(),
            role.getRoleName(),
            role.getPermissions()
        );
    }

    public static RoleListDto toDto(RoleList roleList) {
        if (roleList == null) {
            return new RoleListDto(List.of());
        }

        return new RoleListDto(
            roleList.getRolesList().stream().map(ProtoMapper::toDto).collect(Collectors.toList())
        );
    }

    public static RoleListDto toDtoFromRoles(List<Role> roles) {
        if (roles == null) {
            return new RoleListDto(List.of());
        }

        return new RoleListDto(
            roles.stream().map(ProtoMapper::toDto).collect(Collectors.toList())
        );
    }

    public static GuildDto toDto(Guild guild) {
        if (guild == null) {
            return new GuildDto(null, null, null, null, List.of());
        }

        return new GuildDto(
            guild.getGuildId(),
            guild.getName(),
            guild.getIcon(),
            guild.getOwnerId(),
            guild.getRolesList().stream().map(ProtoMapper::toDto).collect(Collectors.toList())
        );
    }

    public static GuildListDto toGuildListDto(List<Guild> guilds) {
        if (guilds == null) {
            return new GuildListDto(List.of());
        }

        return new GuildListDto(
            guilds.stream().map(ProtoMapper::toDto).collect(Collectors.toList())
        );
    }

    public static ChannelDto toDto(Channel channel) {
        if (channel == null) {
            return new ChannelDto(null, null, null, new RoleListDto(List.of()));
        }

        RoleListDto overridesDto = toDto(channel.getOverrides());

        return new ChannelDto(
            channel.getChannelId(),
            channel.getName(),
            channel.getGuildId(),
            overridesDto
        );
    }

    public static ChannelListDto toChannelListDto(List<Channel> channels) {
        if (channels == null) {
            return new ChannelListDto(List.of());
        }

        return new ChannelListDto(
            channels.stream().map(ProtoMapper::toDto).collect(Collectors.toList())
        );
    }

    public static GuildUserDto toDto(GuildUser guildUser) {
        if (guildUser == null) {
            return new GuildUserDto(null, null, new RoleListDto(List.of()));
        }

        return new GuildUserDto(
            guildUser.getGuildUserId(),
            guildUser.getNick(),
            mapGuildUserRoles(guildUser)
        );
    }

    public static GuildUserListDto toGuildUserListDto(List<GuildUser> users) {
        if (users == null) {
            return new GuildUserListDto(List.of());
        }

        return new GuildUserListDto(
            users.stream().map(ProtoMapper::toDto).collect(Collectors.toList())
        );
    }

    public static MessageDto toDto(Message message) {
        if (message == null) {
            return new MessageDto(null, null, null);
        }

        return new MessageDto(
            message.getMessageId(),
            toDto(message.getAuthor()),
            message.getContent()
        );
    }

    public static MessageListDto toMessageListDto(List<Message> messages) {
        if (messages == null) {
            return new MessageListDto(List.of());
        }

        return new MessageListDto(
            messages.stream().map(ProtoMapper::toDto).collect(Collectors.toList())
        );
    }

    private static RoleListDto mapGuildUserRoles(GuildUser guildUser) {
        return toDto(guildUser.getRoles());
    }

}
