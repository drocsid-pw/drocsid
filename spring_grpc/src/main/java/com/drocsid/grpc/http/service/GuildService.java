package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.http.controller.GuildController;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mappings.UserCallerMappingRepository;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
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

        CreateGuildRequest request = CreateGuildRequest.newBuilder().setCallerId(String.valueOf(callerId))
                .setName(name).setIcon(icon).build();

        Guild guild = coreClient.createGuild(request);
        return ProtoMapper.toDto(guild);
    }

    public GuildDto getGuild(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        GuildInfoReq request = GuildInfoReq.newBuilder().setGuildId(guildId).setCallerId(String.valueOf(callerId)).build();
        Guild guild = coreClient.getGuild(request);
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

        Guild updatedGuild = Guild.newBuilder().setGuildId(guildId).setName(name)
                .setIcon(icon).setOwnerId(String.valueOf(ownerId)).addAllRoles(roles)
                .build();
        UpdateGuildRequest request = UpdateGuildRequest.newBuilder().setCallerId(String.valueOf(callerId)).
                setGuild(updatedGuild).build();

        Guild updated = coreClient.updateGuild(request);
        return ProtoMapper.toDto(updated);
    }

    public ResponseMessageDto deleteGuild(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        GuildInfoReq request = GuildInfoReq.newBuilder().setGuildId(guildId).
                setCallerId(String.valueOf(callerId)).build();

        coreClient.deleteGuild(request);
        return new ResponseMessageDto("Guild deleted successfully.");
    }

    public ChannelListDto getAllChannels(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        GuildInfoReq request = GuildInfoReq.newBuilder().setGuildId(guildId)
                .setCallerId(String.valueOf(callerId)).build();

        List<Channel> channels = coreClient.getAllChannels(request);
        return ProtoMapper.toChannelListDto(channels);
    }

    public ChannelDto createChannel(String authedUserId, String guildId, String name) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (name == null || name.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CreateChannelRequest request = CreateChannelRequest.newBuilder().setCallerId(String.valueOf(callerId))
                .setGuildId(guildId).setName(name).build();

        Channel channel = coreClient.createChannel(request);
        return ProtoMapper.toDto(channel);
    }

    public RoleListDto getRoles(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        GuildInfoReq request = GuildInfoReq.newBuilder().setGuildId(guildId)
                .setCallerId(String.valueOf(callerId)).build();

        List<Role> roles = coreClient.getRoles(request);
        return ProtoMapper.toDtoFromRoles(roles);
    }

    public RoleDto getRole(String authedUserId, String guildId, String guildRoleId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        RoleReq request = RoleReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setGuildId(guildId).setGuildRoleId(guildRoleId).build();

        Role role = coreClient.getRole(request);
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

        CreateRoleReq request = CreateRoleReq.newBuilder().setGuildId(guildId).setRoleName(roleName)
                .setPermissions(permissions).setCallerId(String.valueOf(callerId)).build();

        Role role = coreClient.createRole(request);
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

        Role updatedRole = Role.newBuilder().setGuildRoleId(guildRoleId).setRoleName(roleName)
                .setPermissions(permissions).build();
        UpdateRoleReq request = UpdateRoleReq.newBuilder().setGuildId(guildId)
                .setRole(updatedRole)
                .setCallerId(String.valueOf(callerId)).build();

        Role role = coreClient.updateRole(request);
        return ProtoMapper.toDto(role);
    }

    public GuildUserDto addUserToGuild(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        AddUser request = AddUser.newBuilder().setCallerId(String.valueOf(callerId))
                .setGuildId(guildId).build();

        GuildUser guildUser = coreClient.addUser(request);
        return ProtoMapper.toDto(guildUser);
    }

    public GuildUserListDto getGuildUsers(String authedUserId, String guildId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        GuildInfoReq request = GuildInfoReq.newBuilder().setGuildId(guildId).
                setCallerId(String.valueOf(callerId)).build();

        List<GuildUser> users = coreClient.getGuildUsers(request);
        return ProtoMapper.toGuildUserListDto(users);
    }

    public GuildUserDto getGuildUser(String authedUserId, String guildId, String guildUserId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        GuildUserReq request = GuildUserReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setGuildId(guildId).setGuildUserId(guildUserId).build();

        GuildUser user = coreClient.getGuildUser(request);
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

        RoleList roleList = RoleList.newBuilder().addAllRoles(roles).build();
        GuildUser guildUser = GuildUser.newBuilder().setGuildUserId(userBody.getGuildUserId())
                .setNick(userBody.getNick()).setRoles(roleList).build();
        UpdateUserReq request = UpdateUserReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setGuildId(guildId).setUser(guildUser).build();

        GuildUser updated = coreClient.updateGuildUser(request);
        return ProtoMapper.toDto(updated);
    }

    public ResponseMessageDto deleteGuildUser(String authedUserId, String guildId, String guildUserId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        GuildUserReq request = GuildUserReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setGuildId(guildId).setGuildUserId(guildUserId).build();

        coreClient.deleteGuildUser(request);
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