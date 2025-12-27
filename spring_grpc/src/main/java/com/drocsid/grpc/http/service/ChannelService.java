package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.http.controller.ChannelController;
import com.drocsid.grpc.http.dto.ChannelDto;
import com.drocsid.grpc.http.dto.MessageDto;
import com.drocsid.grpc.http.dto.MessageListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.mappings.UserCallerMappingRepository;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
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

        ChannelInfoReq request = ChannelInfoReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setChannelId(channelId).build();

        Channel channel = coreClient.getChannel(request);
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

        RoleList roleList = (ch.getOverrides() != null)
                ? mapRoleList(ch.getOverrides())
                : RoleList.newBuilder().build();
        Channel updatedChannel = Channel.newBuilder().setChannelId(channelId).setName(ch.getName())
                .setGuildId(ch.getGuildId()).setOverrides(roleList).build();
        UpdateChannelRequest request = UpdateChannelRequest.newBuilder().setCallerId(String.valueOf(callerId))
                .setChannel(updatedChannel).build();

        Channel updated = coreClient.updateChannel(request);
        return ProtoMapper.toDto(updated);
    }

    public ResponseMessageDto deleteChannel(String authedUserId, String channelId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        ChannelInfoReq request = ChannelInfoReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setChannelId(channelId).build();

        coreClient.deleteChannel(request);
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

        ChannelInfoReq channelReq = ChannelInfoReq.newBuilder().setCallerId(String.valueOf(callerId))
            .setChannelId(channelId).build();

        MessageBucketReq request = MessageBucketReq.newBuilder().setReq(channelReq)
                .setOffset(offset).setCount(count).build();

        List<Message> messages = coreClient.getMessages(request);
        return ProtoMapper.toMessageListDto(messages);
    }

    public MessageDto createMessage(String authedUserId, String channelId, String content) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (content == null || content.trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("message.content is required").asRuntimeException();
        }

        ChannelInfoReq channelReq = ChannelInfoReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setChannelId(channelId).build();

        GeneralCreateMessageRequest messageReq = GeneralCreateMessageRequest.newBuilder().setContent(content)
                .build();

        CreateMessageReq request = CreateMessageReq.newBuilder().setReq(channelReq)
                .setMessage(messageReq).build();

        Message msg = coreClient.createMessage(request);
        return ProtoMapper.toDto(msg);
    }

    public ResponseMessageDto deleteMessage(String authedUserId, String channelId, String messageId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        ChannelInfoReq channelReq = ChannelInfoReq.newBuilder().setCallerId(String.valueOf(callerId))
                .setChannelId(channelId).build();

        GeneralMessageReq messageReq = GeneralMessageReq.newBuilder().setMessageId(messageId).build();

        MessageReq request = MessageReq.newBuilder().setReq(channelReq).setMessageReq(messageReq).build();

        coreClient.deleteMessage(request);
        return new ResponseMessageDto("Message deleted successfully.");
    }

}