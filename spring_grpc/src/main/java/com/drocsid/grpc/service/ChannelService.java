package com.drocsid.grpc.service;
import com.drocsid.grpc.core_requests.channel.CoreUpdateChannelRequest;
import com.drocsid.grpc.core_requests.channel.CoreCreateMessageRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import com.drocsid.grpc.proto.UpdateChannelRequest;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigInteger;
import java.util.List;

@GrpcService
public class ChannelService extends ChannelServiceGrpc.ChannelServiceImplBase {

    private final CoreClient coreClient;

    public ChannelService(CoreClient coreClient) {
        this.coreClient = coreClient;
    }

    @Override
    public void getChannelInfo(ChannelId channelId, StreamObserver<ChannelInfo> responseObserver) {
        try {
            ChannelInfo channel = coreClient.getChannelInfo(new BigInteger(channelId.getUserId()),
                new BigInteger(channelId.getId()));

            responseObserver.onNext(channel);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void updateChannel(UpdateChannelRequest request,
                           StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.updateChannel(new CoreUpdateChannelRequest(request));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Channel updated successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void createMessage(CreateMessageRequest request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.createMessage(new CoreCreateMessageRequest(request));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Message created successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void deleteMessage(MessageId messageId, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.deleteMessage(new BigInteger(messageId.getUserId()), new BigInteger(messageId.getId()));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Message deleted successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void getLastMessage(ChannelId channelId, StreamObserver<Message> responseObserver) {
        try {
            Message message = coreClient.getLastMessage(new BigInteger(channelId.getUserId()),
                new BigInteger(channelId.getId()));

            responseObserver.onNext(message);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void getAllMessages(ChannelId channelId, StreamObserver<MessageList> responseObserver) {
        try {
            List<Message> messages = coreClient.getAllMessages(new BigInteger(channelId.getUserId()),
                new BigInteger(channelId.getId()));

            MessageList list = MessageList.newBuilder().addAllMessages(messages).build();
            responseObserver.onNext(list);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}
