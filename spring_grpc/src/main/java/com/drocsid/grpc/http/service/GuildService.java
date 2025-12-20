package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.http.controller.GuildController;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.Channel;
import com.drocsid.grpc.proto.Guild;
import com.drocsid.grpc.proto.GuildUser;
import com.drocsid.grpc.proto.Role;
import com.fasterxml.jackson.databind.JsonNode;
import io.grpc.Status;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

import static com.drocsid.grpc.http.controller.GuildController.mapRoles;

@Service
public class GuildService {

    private final CoreClient coreClient;

    public GuildService(CoreClient coreClient) {
        this.coreClient = coreClient;
    }

    public GuildDto createGuild(String authedUserId, String name, String icon) {
        if (name == null || name.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CoreCreateGuildRequest req = new CoreCreateGuildRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                name,
                icon == null ? "" : icon
        );

        Guild guild = coreClient.createGuild(req);
        return ProtoMapper.toDto(guild);
    }

    public GuildDto getGuild(String authedUserId, String guildId) {
        CoreGetGuildRequest req = new CoreGetGuildRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId")
        );

        Guild guild = coreClient.getGuild(req);
        return ProtoMapper.toDto(guild);
    }

    public GuildDto updateGuild(String authedUserId, String guildId, GuildController.GuildBody guild) {
        if (guild == null) {
            throw Status.INVALID_ARGUMENT.withDescription("guild is required").asRuntimeException();
        }

        String name = guild.getName();
        if (name == null || name.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("guild.name is required").asRuntimeException();
        }

        String icon = guild.getIcon() == null ? "" : guild.getIcon();
        BigInteger ownerId = guild.getOwnerId() == null
                ? IdParser.toBigInteger(authedUserId, "callerId")
                : IdParser.toBigInteger(guild.getOwnerId(), "ownerId");

        List<Role> roles = mapRoles(guild.getRoles());

        CoreUpdateGuildRequest req = new CoreUpdateGuildRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId"),
                name,
                icon,
                ownerId,
                roles
        );

        Guild updated = coreClient.updateGuild(req);
        return ProtoMapper.toDto(updated);
    }

    public ResponseMessageDto deleteGuild(String authedUserId, String guildId) {
        CoreDeleteGuildRequest req = new CoreDeleteGuildRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId")
        );

        coreClient.deleteGuild(req);
        return new ResponseMessageDto("Guild deleted successfully.");
    }

    public ChannelListDto getAllChannels(String authedUserId, String guildId) {
        CoreGetAllChannelsRequest req = new CoreGetAllChannelsRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId")
        );

        List<Channel> channels = coreClient.getAllChannels(req);
        return ProtoMapper.toChannelListDto(channels);
    }

    public ChannelDto createChannel(String authedUserId, String guildId, String name) {
        if (name == null || name.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CoreCreateChannelRequest req = new CoreCreateChannelRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                name,
                IdParser.toBigInteger(guildId, "guildId")
        );

        Channel channel = coreClient.createChannel(req);
        return ProtoMapper.toDto(channel);
    }

    public RoleListDto getRoles(String authedUserId, String guildId) {
        CoreGetRolesRequest req = new CoreGetRolesRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId")
        );

        List<Role> roles = coreClient.getRoles(req);
        return ProtoMapper.toDtoFromRoles(roles);
    }

    public RoleDto getRole(String authedUserId, String guildId, String guildRoleId) {
        CoreGetRoleRequest req = new CoreGetRoleRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildRoleId, "guildRoleId")
        );

        Role role = coreClient.getRole(req);
        return ProtoMapper.toDto(role);
    }

    public RoleDto createRole(String authedUserId, String guildId, String roleName, String permissions) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("roleName is required").asRuntimeException();
        }

        if (permissions == null || permissions.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("permissions is required").asRuntimeException();
        }

        CoreCreateRoleRequest req = new CoreCreateRoleRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId"),
                roleName,
                permissions
        );

        Role role = coreClient.createRole(req);
        return ProtoMapper.toDto(role);
    }

    public RoleDto updateRole(String authedUserId, String guildId, String guildRoleId, GuildController.RoleBody roleBody) {
        if (roleBody == null) {
            throw Status.INVALID_ARGUMENT.withDescription("role is required").asRuntimeException();
        }

        String roleName = roleBody.getRoleName();
        if (roleName == null || roleName.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("role.roleName is required").asRuntimeException();
        }

        String permissions = roleBody.getPermissions();
        if (permissions == null || permissions.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("role.permissions is required").asRuntimeException();
        }

        CoreUpdateRoleRequest req = new CoreUpdateRoleRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildRoleId, "guildRoleId"),
                roleName,
                permissions
        );

        Role role = coreClient.updateRole(req);
        return ProtoMapper.toDto(role);
    }

    public GuildUserDto addUserToGuild(String authedUserId, String guildId) {
        CoreAddUserRequest req = new CoreAddUserRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId")
        );

        GuildUser guildUser = coreClient.addUser(req);
        return ProtoMapper.toDto(guildUser);
    }

    public GuildUserListDto getGuildUsers(String authedUserId, String guildId) {
        CoreGetGuildUsersRequest req = new CoreGetGuildUsersRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId")
        );

        List<GuildUser> users = coreClient.getGuildUsers(req);
        return ProtoMapper.toGuildUserListDto(users);
    }

    public GuildUserDto getGuildUser(String authedUserId, String guildId, String guildUserId) {
        CoreGetGuildUserRequest req = new CoreGetGuildUserRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildUserId, "guildUserId")
        );

        GuildUser user = coreClient.getGuildUser(req);
        return ProtoMapper.toDto(user);
    }

    public GuildUserDto updateGuildUser(String authedUserId, String guildId, String guildUserId, GuildController.GuildUserBody userBody) {
        if (userBody == null) {
            throw Status.INVALID_ARGUMENT.withDescription("user is required").asRuntimeException();
        }

        if (userBody.getGuildUserId() != null && !guildUserId.equals(userBody.getGuildUserId())) {
            throw Status.INVALID_ARGUMENT.withDescription("guildUserId path/body mismatch").asRuntimeException();
        }

        if (userBody.getNick() == null || userBody.getNick().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("user.nick is required").asRuntimeException();
        }

        List<Role> roles = parseRolesFromJson(userBody.getRoles());

        CoreUpdateGuildUserRequest req = new CoreUpdateGuildUserRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId"),
                userBody.getNick(),
                roles
        );

        GuildUser updated = coreClient.updateGuildUser(req);
        return ProtoMapper.toDto(updated);
    }

    public static List<Role> parseRolesFromJson(JsonNode rolesNode) {
        if (rolesNode == null || rolesNode.isNull()) {
            return List.of();
        }

        List<JsonNode> roleNodes = new ArrayList<>();

        if (rolesNode.isArray()) {
            rolesNode.forEach(roleNodes::add);
        } else if (rolesNode.isObject() && rolesNode.has("roles") && rolesNode.get("roles").isArray()) {
            rolesNode.get("roles").forEach(roleNodes::add);
        } else {
            throw Status.INVALID_ARGUMENT.withDescription("user.roles must be an array or { roles: [...] }").asRuntimeException();
        }

        List<Role> roles = new ArrayList<>();
        for (JsonNode node : roleNodes) {
            if (!node.isObject()) {
                continue;
            }

            Role.Builder b = Role.newBuilder();

            if (node.hasNonNull("guildRoleId")) {
                b.setGuildRoleId(node.get("guildRoleId").asText());
            }
            if (node.hasNonNull("roleName")) {
                b.setRoleName(node.get("roleName").asText());
            }
            if (node.hasNonNull("permissions")) {
                b.setPermissions(node.get("permissions").asText());
            }

            roles.add(b.build());
        }

        return roles;
    }

    public ResponseMessageDto deleteGuildUser(String authedUserId, String guildId, String guildUserId) {
        CoreDeleteGuildUserRequest req = new CoreDeleteGuildUserRequest(
                IdParser.toBigInteger(authedUserId, "callerId"),
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildUserId, "guildUserId")
        );

        coreClient.deleteGuildUser(req);
        return new ResponseMessageDto("User deleted successfully.");
    }
}