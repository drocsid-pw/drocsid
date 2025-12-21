package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.http.controller.ChannelController;
import com.drocsid.grpc.http.dto.ChannelDto;
import com.drocsid.grpc.http.dto.MessageDto;
import com.drocsid.grpc.http.dto.MessageListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mappings.UserCallerMappingRepository;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.Channel;
import com.drocsid.grpc.proto.Message;
import com.drocsid.grpc.proto.RoleList;
import io.grpc.Status;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

import static com.drocsid.grpc.http.controller.ChannelController.mapRoleList;

@Service
public class ChannelService {

    private final CoreClient coreClient;
    private final UserCallerMappingRepository repository;

    public ChannelService(CoreClient coreClient, UserCallerMappingRepository repository) {
        this.coreClient = coreClient;
        this.repository = repository;
    }

    public ChannelDto getChannel(String authedUserId, String channelId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreGetChannelRequest req = new CoreGetChannelRequest(
                callerId,
                IdParser.toBigInteger(channelId, "channelId")
        );

        Channel channel = coreClient.getChannel(req);
        return ProtoMapper.toDto(channel);
    }

    public ChannelDto updateChannel(String authedUserId, String channelId, ChannelController.ChannelBody ch) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        Channel.Builder builder = Channel.newBuilder()
                .setChannelId(channelId)
                .setName(ch.getName());

        if (ch.getGuildId() != null) {
            builder.setGuildId(ch.getGuildId());
        }

        builder.setOverrides(
                ch.getOverrides() != null ? mapRoleList(ch.getOverrides()) : RoleList.newBuilder().build()
        );

        CoreUpdateChannelRequest req = new CoreUpdateChannelRequest(
                callerId,
                builder.build()
        );

        Channel updated = coreClient.updateChannel(req);
        return ProtoMapper.toDto(updated);
    }

    public ResponseMessageDto deleteChannel(String authedUserId, String channelId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreDeleteChannelRequest req = new CoreDeleteChannelRequest(
                callerId,
                IdParser.toBigInteger(channelId, "channelId")
        );

        coreClient.deleteChannel(req);
        return new ResponseMessageDto("Channel deleted successfully.");
    }

    public MessageListDto getMessages(String authedUserId, String channelId, int offset, int count) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (offset < 0) {
            throw Status.INVALID_ARGUMENT.withDescription("offset must be >= 0").asRuntimeException();
        }
        if (count <= 0) {
            throw Status.INVALID_ARGUMENT.withDescription("count must be > 0").asRuntimeException();
        }

        CoreGetMessagesRequest req = new CoreGetMessagesRequest(
                callerId,
                IdParser.toBigInteger(channelId, "channelId"),
                offset,
                count
        );

        List<Message> messages = coreClient.getMessages(req);
        return ProtoMapper.toMessageListDto(messages);
    }

    public MessageDto createMessage(String authedUserId, String channelId, String content) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (content == null || content.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("message.content is required").asRuntimeException();
        }

        CoreCreateMessageRequest req = new CoreCreateMessageRequest(
                callerId,
                IdParser.toBigInteger(channelId, "channelId"),
                content
        );

        Message msg = coreClient.createMessage(req);
        return ProtoMapper.toDto(msg);
    }

    public ResponseMessageDto deleteMessage(String authedUserId, String channelId, String messageId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        CoreDeleteMessageRequest req = new CoreDeleteMessageRequest(
                callerId,
                IdParser.toBigInteger(channelId, "channelId"),
                IdParser.toBigInteger(messageId, "messageId")
        );

        coreClient.deleteMessage(req);
        return new ResponseMessageDto("Message deleted successfully.");
    }

}