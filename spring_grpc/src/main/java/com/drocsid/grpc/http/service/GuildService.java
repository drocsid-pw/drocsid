package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.http.controller.GuildController;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mappings.UserCallerMappingRepository;
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
    private final UserCallerMappingRepository repository;

    public GuildService(CoreClient coreClient, UserCallerMappingRepository repository) {
        this.coreClient = coreClient;
        this.repository = repository;
    }

    public GuildDto createGuild(String authedUserId, String name, String icon) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (name == null || name.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CoreCreateGuildRequest req = new CoreCreateGuildRequest(
                callerId,
                name,
                icon == null ? "" : icon
        );

        Guild guild = coreClient.createGuild(req);
        return ProtoMapper.toDto(guild);
    }

    public GuildDto getGuild(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreGetGuildRequest req = new CoreGetGuildRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId")
        );

        Guild guild = coreClient.getGuild(req);
        return ProtoMapper.toDto(guild);
    }

    public GuildDto updateGuild(String authedUserId, String guildId, GuildController.GuildBody guild) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

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
                callerId,
                IdParser.toBigInteger(guildId, "guildId"),
                name,
                icon,
                ownerId,
                roles
        );

        Guild updated = coreClient.updateGuild(req);
        return ProtoMapper.toDto(updated);
    }

    public ResponseMessageDto deleteGuild(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreDeleteGuildRequest req = new CoreDeleteGuildRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId")
        );

        coreClient.deleteGuild(req);
        return new ResponseMessageDto("Guild deleted successfully.");
    }

    public ChannelListDto getAllChannels(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreGetAllChannelsRequest req = new CoreGetAllChannelsRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId")
        );

        List<Channel> channels = coreClient.getAllChannels(req);
        return ProtoMapper.toChannelListDto(channels);
    }

    public ChannelDto createChannel(String authedUserId, String guildId, String name) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (name == null || name.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CoreCreateChannelRequest req = new CoreCreateChannelRequest(
                callerId,
                name,
                IdParser.toBigInteger(guildId, "guildId")
        );

        Channel channel = coreClient.createChannel(req);
        return ProtoMapper.toDto(channel);
    }

    public RoleListDto getRoles(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreGetRolesRequest req = new CoreGetRolesRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId")
        );

        List<Role> roles = coreClient.getRoles(req);
        return ProtoMapper.toDtoFromRoles(roles);
    }

    public RoleDto getRole(String authedUserId, String guildId, String guildRoleId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreGetRoleRequest req = new CoreGetRoleRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildRoleId, "guildRoleId")
        );

        Role role = coreClient.getRole(req);
        return ProtoMapper.toDto(role);
    }

    public RoleDto createRole(String authedUserId, String guildId, String roleName, String permissions) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (roleName == null || roleName.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("roleName is required").asRuntimeException();
        }

        if (permissions == null || permissions.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("permissions is required").asRuntimeException();
        }

        CoreCreateRoleRequest req = new CoreCreateRoleRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId"),
                roleName,
                permissions
        );

        Role role = coreClient.createRole(req);
        return ProtoMapper.toDto(role);
    }

    public RoleDto updateRole(String authedUserId, String guildId, String guildRoleId, GuildController.RoleBody roleBody) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

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
                callerId,
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildRoleId, "guildRoleId"),
                roleName,
                permissions
        );

        Role role = coreClient.updateRole(req);
        return ProtoMapper.toDto(role);
    }

    public GuildUserDto addUserToGuild(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreAddUserRequest req = new CoreAddUserRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId")
        );

        GuildUser guildUser = coreClient.addUser(req);
        return ProtoMapper.toDto(guildUser);
    }

    public GuildUserListDto getGuildUsers(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreGetGuildUsersRequest req = new CoreGetGuildUsersRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId")
        );

        List<GuildUser> users = coreClient.getGuildUsers(req);
        return ProtoMapper.toGuildUserListDto(users);
    }

    public GuildUserDto getGuildUser(String authedUserId, String guildId, String guildUserId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreGetGuildUserRequest req = new CoreGetGuildUserRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildUserId, "guildUserId")
        );

        GuildUser user = coreClient.getGuildUser(req);
        return ProtoMapper.toDto(user);
    }

    public GuildUserDto updateGuildUser(String authedUserId, String guildId, String guildUserId, GuildController.GuildUserBody userBody) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

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
                callerId,
                IdParser.toBigInteger(guildId, "guildId"),
                userBody.getNick(),
                roles
        );

        GuildUser updated = coreClient.updateGuildUser(req);
        return ProtoMapper.toDto(updated);
    }

    public ResponseMessageDto deleteGuildUser(String authedUserId, String guildId, String guildUserId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreDeleteGuildUserRequest req = new CoreDeleteGuildUserRequest(
                callerId,
                IdParser.toBigInteger(guildId, "guildId"),
                IdParser.toBigInteger(guildUserId, "guildUserId")
        );

        coreClient.deleteGuildUser(req);
        return new ResponseMessageDto("User deleted successfully.");
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
}