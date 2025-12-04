package com.drocsid.grpc.service;
import com.drocsid.grpc.core_requests.create.CoreCreateChannelRequest;
import com.drocsid.grpc.core_requests.update.CoreUpdateChannelRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import com.drocsid.grpc.proto.CreateChannelRequest;
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
    public void createChannel(CreateChannelRequest request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.createChannel(new CoreCreateChannelRequest(request));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Channel created successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void getChannel(ChannelId channelId, StreamObserver<Channel> responseObserver) {
        try {
            Channel channel = coreClient.getChannel(new BigInteger(channelId.getUserId()),
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
    public void deleteChannel(ChannelId channelId, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.deleteChannel(new BigInteger(channelId.getUserId()), new BigInteger(channelId.getId()));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Channel deleted successfully.")
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
