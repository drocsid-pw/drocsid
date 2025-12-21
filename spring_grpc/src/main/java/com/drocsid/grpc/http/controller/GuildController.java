package com.drocsid.grpc.http.controller;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.http.service.GuildService;
import com.drocsid.grpc.proto.*;
import com.fasterxml.jackson.databind.JsonNode;
import io.grpc.Status;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/guilds")
public class GuildController {

    private final GuildService guildService;
    private final JwtAuthService jwtAuthService;

    public GuildController(GuildService guildService, JwtAuthService jwtAuthService) {
        this.guildService = guildService;
        this.jwtAuthService = jwtAuthService;
    }

    @PostMapping
    public GuildDto createGuild(
        @RequestHeader(value = "Authorization") String authorization,
        @RequestBody CreateGuildBody body) {
        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.createGuild(authedUserId, body.getName(), body.getIcon());
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{guildId}")
    public GuildDto getGuild(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);
        try {
            return guildService.getGuild(authedUserId, guildId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @PutMapping("/{guildId}")
    public GuildDto putGuild(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @Valid @RequestBody PutGuildBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.updateGuild(authedUserId, guildId, body.getGuild());
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @DeleteMapping("/{guildId}")
    public ResponseMessageDto deleteGuild(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.deleteGuild(authedUserId, guildId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{guildId}/channels")
    public ChannelListDto getAllChannels(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.getAllChannels(authedUserId, guildId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @PostMapping("/{guildId}/channels")
    public ChannelDto createChannel(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @Valid @RequestBody CreateChannelBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.createChannel(authedUserId, guildId, body.getName());
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{guildId}/roles")
    public RoleListDto getRoles(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.getRoles(authedUserId, guildId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{guildId}/roles/{guildRoleId}")
    public RoleDto getRole(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @PathVariable String guildRoleId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);
        try {
            return guildService.getRole(authedUserId, guildId, guildRoleId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @PostMapping("/{guildId}/roles")
    public RoleDto createRole(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @Valid @RequestBody CreateRoleBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.createRole(authedUserId, guildId, body.getRoleName(), body.getPermissions());
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @PutMapping("/{guildId}/roles/{guildRoleId}")
    public RoleDto putRole(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @PathVariable String guildRoleId,
            @Valid @RequestBody PutRoleBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.updateRole(authedUserId, guildId, guildRoleId, body.getRole());
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @DeleteMapping("/{guildId}/roles/{guildRoleId}")
    public ResponseMessageDto deleteRoleNotImplemented() {
        throw Status.UNIMPLEMENTED.withDescription("DeleteRole is not implemented in gRPC schema yet").asRuntimeException();
    }

    @PostMapping("/{guildId}/users")
    public GuildUserDto addUserToGuild(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.addUserToGuild(authedUserId, guildId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{guildId}/users")
    public GuildUserListDto getGuildUsers(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.getGuildUsers(authedUserId, guildId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{guildId}/users/{guildUserId}")
    public GuildUserDto getGuildUser(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @PathVariable String guildUserId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.getGuildUser(authedUserId, guildId, guildUserId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @PutMapping("/{guildId}/users/{guildUserId}")
    public GuildUserDto putGuildUser(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @PathVariable String guildUserId,
            @Valid @RequestBody PutGuildUserBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.updateGuildUser(authedUserId, guildId, guildUserId, body.getUser());
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @DeleteMapping("/{guildId}/users/{guildUserId}")
    public ResponseMessageDto deleteGuildUser(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String guildId,
            @PathVariable String guildUserId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return guildService.deleteGuildUser(authedUserId, guildId, guildUserId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    public static List<Role> mapRoles(List<RoleBody> roles) {
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

    @Data
    public static class CreateGuildBody {
        private String name;
        private String icon;
    }

    @Data
    public static class PutGuildBody {
        private GuildBody guild;
    }

    @Data
    public static class GuildBody {
        private String guildId;
        private String name;
        private String icon;
        private String ownerId;
        private List<RoleBody> roles;
    }

    @Data
    public static class RoleBody {
        private String guildRoleId;
        private String roleName;
        private String permissions;
    }

    @Data
    public static class CreateRoleBody {
        private String roleName;
        private String permissions;
    }

    @Data
    public static class PutRoleBody {
        private RoleBody role;
    }

    @Data
    public static class CreateChannelBody {
        private String name;
    }

    @Data
    public static class PutGuildUserBody {
        private GuildUserBody user;
    }

    @Data
    public static class GuildUserBody {
        private String guildUserId;
        private String nick;
        private JsonNode roles;
    }
}
