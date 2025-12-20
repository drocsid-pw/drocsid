package com.drocsid.grpc.http.controller;

import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.http.auth.RestAuthService;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import io.grpc.Status;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/guilds")
public class GuildController {

    private final CoreClient coreClient;
    private final RestAuthService restAuthService;

    public GuildController(CoreClient coreClient, RestAuthService restAuthService) {
        this.coreClient = coreClient;
        this.restAuthService = restAuthService;
    }

    @PostMapping
    public GuildDto createGuild(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody CreateGuildBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getName() == null || body.getName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CoreCreateGuildRequest req = new CoreCreateGuildRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            body.getName(),
            body.getIcon() == null ? "" : body.getIcon()
        );

        Guild guild = coreClient.createGuild(req);
        return ProtoMapper.toDto(guild);
    }

    @GetMapping("/{guildId}")
    public GuildDto getGuild(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreGetGuildRequest req = new CoreGetGuildRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId")
        );

        Guild guild = coreClient.getGuild(req);
        return ProtoMapper.toDto(guild);
    }

    @PutMapping("/{guildId}")
    public GuildDto putGuild(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestBody PutGuildBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getGuild() == null) {
            throw Status.INVALID_ARGUMENT.withDescription("guild is required").asRuntimeException();
        }

        GuildBody guild = body.getGuild();

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

    @DeleteMapping("/{guildId}")
    public ResponseMessageDto deleteGuild(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreDeleteGuildRequest req = new CoreDeleteGuildRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId")
        );

        coreClient.deleteGuild(req);
        return new ResponseMessageDto("Guild deleted successfully.");
    }

    @GetMapping("/{guildId}/channels")
    public ChannelListDto getAllChannels(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreGetAllChannelsRequest req = new CoreGetAllChannelsRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId")
        );

        List<Channel> channels = coreClient.getAllChannels(req);
        return ProtoMapper.toChannelListDto(channels);
    }

    @PostMapping("/{guildId}/channels")
    public ChannelDto createChannel(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestBody CreateChannelBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getName() == null || body.getName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CoreCreateChannelRequest req = new CoreCreateChannelRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            body.getName(),
            IdParser.toBigInteger(guildId, "guildId")
        );

        Channel channel = coreClient.createChannel(req);
        return ProtoMapper.toDto(channel);
    }

    @GetMapping("/{guildId}/roles")
    public RoleListDto getRoles(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreGetRolesRequest req = new CoreGetRolesRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId")
        );

        List<Role> roles = coreClient.getRoles(req);
        return ProtoMapper.toDtoFromRoles(roles);
    }

    @GetMapping("/{guildId}/roles/{guildRoleId}")
    public RoleDto getRole(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @PathVariable String guildRoleId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreGetRoleRequest req = new CoreGetRoleRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId"),
            IdParser.toBigInteger(guildRoleId, "guildRoleId")
        );

        Role role = coreClient.getRole(req);
        return ProtoMapper.toDto(role);
    }

    @PostMapping("/{guildId}/roles")
    public RoleDto createRole(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestBody CreateRoleBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getRoleName() == null || body.getRoleName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("roleName is required").asRuntimeException();
        }

        if (body.getPermissions() == null || body.getPermissions().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("permissions is required").asRuntimeException();
        }

        CoreCreateRoleRequest req = new CoreCreateRoleRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId"),
            body.getRoleName(),
            body.getPermissions()
        );

        Role role = coreClient.createRole(req);
        return ProtoMapper.toDto(role);
    }

    @PutMapping("/{guildId}/roles/{guildRoleId}")
    public RoleDto putRole(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @PathVariable String guildRoleId,
        @RequestBody PutRoleBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getRole() == null) {
            throw Status.INVALID_ARGUMENT.withDescription("role is required").asRuntimeException();
        }

        RoleBody roleBody = body.getRole();

        if (roleBody.getRoleName() == null || roleBody.getRoleName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("role.roleName is required").asRuntimeException();
        }

        if (roleBody.getPermissions() == null || roleBody.getPermissions().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("role.permissions is required").asRuntimeException();
        }

        CoreUpdateRoleRequest req = new CoreUpdateRoleRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId"),
            IdParser.toBigInteger(guildRoleId, "guildRoleId"),
            roleBody.getRoleName(),
            roleBody.getPermissions()
        );

        Role role = coreClient.updateRole(req);
        return ProtoMapper.toDto(role);
    }

    @DeleteMapping("/{guildId}/roles/{guildRoleId}")
    public ResponseMessageDto deleteRoleNotImplemented() {
        throw Status.UNIMPLEMENTED.withDescription("DeleteRole is not implemented in gRPC schema yet").asRuntimeException();
    }

    @PostMapping("/{guildId}/users")
    public GuildUserDto addUserToGuild(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestBody AddUserBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        CoreAddUserRequest req = new CoreAddUserRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId")
        );

        GuildUser guildUser = coreClient.addUser(req);
        return ProtoMapper.toDto(guildUser);
    }

    @GetMapping("/{guildId}/users")
    public GuildUserListDto getGuildUsers(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreGetGuildUsersRequest req = new CoreGetGuildUsersRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId")
        );

        List<GuildUser> users = coreClient.getGuildUsers(req);
        return ProtoMapper.toGuildUserListDto(users);
    }

    @GetMapping("/{guildId}/users/{guildUserId}")
    public GuildUserDto getGuildUser(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @PathVariable String guildUserId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreGetGuildUserRequest req = new CoreGetGuildUserRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId"),
            IdParser.toBigInteger(guildUserId, "guildUserId")
        );

        GuildUser user = coreClient.getGuildUser(req);
        return ProtoMapper.toDto(user);
    }

    @PutMapping("/{guildId}/users/{guildUserId}")
    public GuildUserDto putGuildUser(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @PathVariable String guildUserId,
        @RequestBody PutGuildUserBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getUser() == null) {
            throw Status.INVALID_ARGUMENT.withDescription("user is required").asRuntimeException();
        }

        GuildUserBody userBody = body.getUser();

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

    @DeleteMapping("/{guildId}/users/{guildUserId}")
    public ResponseMessageDto deleteGuildUser(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String guildId,
        @PathVariable String guildUserId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreDeleteGuildUserRequest req = new CoreDeleteGuildUserRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(guildId, "guildId"),
            IdParser.toBigInteger(guildUserId, "guildUserId")
        );

        coreClient.deleteGuildUser(req);
        return new ResponseMessageDto("User deleted successfully.");
    }

    private static List<Role> mapRoles(List<RoleBody> roles) {
        if (roles == null) {
            return List.of();
        }

        List<Role> protoRoles = new ArrayList<>();
        for (RoleBody r : roles) {
            if (r == null) {
                continue;
            }

            Role.Builder b = Role.newBuilder();

            if (r.getGuildRoleId() != null) {
                b.setGuildRoleId(r.getGuildRoleId());
            }
            if (r.getRoleName() != null) {
                b.setRoleName(r.getRoleName());
            }
            if (r.getPermissions() != null) {
                b.setPermissions(r.getPermissions());
            }

            protoRoles.add(b.build());
        }

        return protoRoles;
    }

    private static List<Role> parseRolesFromJson(JsonNode rolesNode) {
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

    @Data
    private static class CreateGuildBody {
        @JsonProperty("caller_id")
        private String callerId;

        private String name;
        private String icon;
    }

    @Data
    private static class PutGuildBody {
        @JsonProperty("caller_id")
        private String callerId;

        private GuildBody guild;
    }

    @Data
    private static class GuildBody {
        private String guildId;
        private String name;
        private String icon;
        private String ownerId;
        private List<RoleBody> roles;
    }

    @Data
    private static class RoleBody {
        private String guildRoleId;
        private String roleName;
        private String permissions;
    }

    @Data
    private static class CreateRoleBody {
        @JsonProperty("caller_id")
        private String callerId;

        private String roleName;
        private String permissions;
    }

    @Data
    private static class PutRoleBody {
        @JsonProperty("caller_id")
        private String callerId;

        private RoleBody role;
    }

    @Data
    private static class CreateChannelBody {
        @JsonProperty("caller_id")
        private String callerId;

        private String name;
    }

    @Data
    private static class AddUserBody {
        @JsonProperty("caller_id")
        private String callerId;
    }

    @Data
    private static class PutGuildUserBody {
        @JsonProperty("caller_id")
        private String callerId;

        private GuildUserBody user;
    }

    @Data
    private static class GuildUserBody {
        private String guildUserId;
        private String nick;
        private JsonNode roles;
    }
}
