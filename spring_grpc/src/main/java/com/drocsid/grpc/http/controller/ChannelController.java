package com.drocsid.grpc.http.controller;

import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.http.auth.RestAuthService;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.Channel;
import com.drocsid.grpc.proto.Message;
import com.drocsid.grpc.proto.Role;
import com.drocsid.grpc.proto.RoleList;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.grpc.Status;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {

    private final CoreClient coreClient;
    private final RestAuthService restAuthService;

    public ChannelController(CoreClient coreClient, RestAuthService restAuthService) {
        this.coreClient = coreClient;
        this.restAuthService = restAuthService;
    }

    @GetMapping("/{channelId}")
    public ChannelDto getChannel(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String channelId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreGetChannelRequest req = new CoreGetChannelRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(channelId, "channelId")
        );

        Channel channel = coreClient.getChannel(req);
        return ProtoMapper.toDto(channel);
    }

    @PutMapping("/{channelId}")
    public ChannelDto putChannel(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String channelId,
        @RequestBody PutChannelBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getChannel() == null) {
            throw Status.INVALID_ARGUMENT.withDescription("channel is required").asRuntimeException();
        }

        ChannelBody ch = body.getChannel();

        if (ch.getName() == null || ch.getName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("channel.name is required").asRuntimeException();
        }

        Channel.Builder builder = Channel.newBuilder()
            .setChannelId(channelId)
            .setName(ch.getName());

        if (ch.getGuildId() != null) {
            builder.setGuildId(ch.getGuildId());
        }

        if (ch.getOverrides() != null) {
            builder.setOverrides(mapRoleList(ch.getOverrides()));
        } else {
            builder.setOverrides(RoleList.newBuilder().build());
        }

        CoreUpdateChannelRequest req = new CoreUpdateChannelRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            builder.build()
        );

        Channel updated = coreClient.updateChannel(req);
        return ProtoMapper.toDto(updated);
    }

    @DeleteMapping("/{channelId}")
    public ResponseMessageDto deleteChannel(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String channelId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreDeleteChannelRequest req = new CoreDeleteChannelRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(channelId, "channelId")
        );

        coreClient.deleteChannel(req);
        return new ResponseMessageDto("Channel deleted successfully.");
    }

    @GetMapping("/{channelId}/messages")
    public MessageListDto getMessages(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String channelId,
        @RequestParam(value = "caller_id", required = false) String callerId,
        @RequestParam(value = "offset", defaultValue = "0") int offset,
        @RequestParam(value = "count", defaultValue = "50") int count
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        if (offset < 0) {
            throw Status.INVALID_ARGUMENT.withDescription("offset must be >= 0").asRuntimeException();
        }
        if (count <= 0) {
            throw Status.INVALID_ARGUMENT.withDescription("count must be > 0").asRuntimeException();
        }

        CoreGetMessagesRequest req = new CoreGetMessagesRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(channelId, "channelId"),
            offset,
            count
        );

        List<Message> messages = coreClient.getMessages(req);
        return ProtoMapper.toMessageListDto(messages);
    }

    @PostMapping("/{channelId}/messages")
    public MessageDto createMessage(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String channelId,
        @RequestBody CreateMessageBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null || body.getMessage() == null || body.getMessage().getContent() == null || body.getMessage().getContent().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("message.content is required").asRuntimeException();
        }

        CoreCreateMessageRequest req = new CoreCreateMessageRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(channelId, "channelId"),
            body.getMessage().getContent()
        );

        Message msg = coreClient.createMessage(req);
        return ProtoMapper.toDto(msg);
    }

    @DeleteMapping("/{channelId}/messages/{messageId}")
    public ResponseMessageDto deleteMessage(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String channelId,
        @PathVariable String messageId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        CoreDeleteMessageRequest req = new CoreDeleteMessageRequest(
            IdParser.toBigInteger(authedUserId, "callerId"),
            IdParser.toBigInteger(channelId, "channelId"),
            IdParser.toBigInteger(messageId, "messageId")
        );

        coreClient.deleteMessage(req);
        return new ResponseMessageDto("Message deleted successfully.");
    }

    private static RoleList mapRoleList(RoleListBody body) {
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
    private static class PutChannelBody {
        @JsonProperty("caller_id")
        private String callerId;

        private ChannelBody channel;
    }

    @Data
    private static class ChannelBody {
        private String name;
        private String guildId;
        private RoleListBody overrides;
    }

    @Data
    private static class RoleListBody {
        private List<RoleBody> roles;
    }

    @Data
    private static class RoleBody {
        private String guildRoleId;
        private String roleName;
        private String permissions;
    }

    @Data
    private static class CreateMessageBody {
        @JsonProperty("caller_id")
        private String callerId;

        private MessageBody message;
    }

    @Data
    private static class MessageBody {
        private String content;
    }
}
