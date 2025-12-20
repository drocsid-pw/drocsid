package com.drocsid.grpc.http.controller;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.http.service.ChannelService;
import com.drocsid.grpc.proto.Role;
import com.drocsid.grpc.proto.RoleList;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    private final ChannelService channelService;
    private final JwtAuthService jwtAuthService;

    public ChannelController(ChannelService channelService, JwtAuthService jwtAuthService) {
        this.channelService = channelService;
        this.jwtAuthService = jwtAuthService;
    }

    @GetMapping("/{channelId}")
    public ChannelDto getChannel(
        @RequestHeader(value = "Authorization") String authorization,
        @PathVariable String channelId) {
        String authedUserId = jwtAuthService.checkAuth(authorization);

        return channelService.getChannel(channelId, authedUserId);
    }

    @PutMapping("/{channelId}")
    public ChannelDto putChannel(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String channelId,
            @Valid @RequestBody PutChannelBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        ChannelBody ch = body.getChannel();

        return channelService.updateChannel(authedUserId, channelId, ch);
    }

    @DeleteMapping("/{channelId}")
    public ResponseMessageDto deleteChannel(
        @RequestHeader(value = "Authorization") String authorization,
        @PathVariable String channelId) {
        String authedUserId = jwtAuthService.checkAuth(authorization);

        return channelService.deleteChannel(authedUserId, channelId);
    }

    @GetMapping("/{channelId}/messages")
    public MessageListDto getMessages(
        @RequestHeader(value = "Authorization") String authorization,
        @PathVariable String channelId,
        @RequestParam(value = "offset", defaultValue = "0") int offset,
        @RequestParam(value = "count", defaultValue = "50") int count) {
        String authedUserId = jwtAuthService.checkAuth(authorization);

        return channelService.getMessages(authedUserId, channelId, offset, count);
    }

    @PostMapping("/{channelId}/messages")
    public MessageDto createMessage(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String channelId,
            @Valid @RequestBody CreateMessageBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);
        String content = body.getMessage().getContent();

        return channelService.createMessage(authedUserId, channelId, content);
    }

    @DeleteMapping("/{channelId}/messages/{messageId}")
    public ResponseMessageDto deleteMessage(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String channelId,
            @PathVariable String messageId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        return channelService.deleteMessage(authedUserId, channelId, messageId);
    }

    public static RoleList mapRoleList(RoleListBody body) {
        if (body.getRoles() == null) {
            return RoleList.newBuilder().build();
        }

        List<Role> roles = new ArrayList<>();
        for (RoleBody r : body.getRoles()) {
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

            roles.add(b.build());
        }

        return RoleList.newBuilder().addAllRoles(roles).build();
    }

    @Data
    public static class PutChannelBody {
        private ChannelBody channel;
    }

    @Data
    public static class ChannelBody {
        @NotBlank(message = "channel.name is required")
        private String name;
        private String guildId;
        private RoleListBody overrides;
    }

    @Data
    public static class RoleListBody {
        private List<RoleBody> roles;
    }

    @Data
    public static class RoleBody {
        private String guildRoleId;
        private String roleName;
        private String permissions;
    }

    @Data
    public static class CreateMessageBody {
        private MessageBody message;
    }

    @Data
    public static class MessageBody {
        @NotBlank(message = "message.content is required")
        private String content;
    }
}
