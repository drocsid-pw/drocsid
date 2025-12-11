package com.drocsid.grpc.service;
import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.channel.CoreGetMessagesRequest;
import com.drocsid.grpc.core_requests.channel.CoreUpdateChannelRequest;
import com.drocsid.grpc.core_requests.channel.CoreCreateMessageRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import com.drocsid.grpc.proto.UpdateChannelRequest;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigInteger;
import java.util.List;

@GrpcService
public class ChannelService extends ChannelServiceGrpc.ChannelServiceImplBase {

    private final CoreClient coreClient;
    private final JwtAuthService jwtAuthService;

    public ChannelService(CoreClient coreClient, JwtAuthService jwtAuthService) {
        this.coreClient = coreClient;
        this.jwtAuthService = jwtAuthService;
    }

    @Override
    public void getChannel(ChannelInfoReq request, StreamObserver<Channel> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            Channel channel = coreClient.getChannel(new BigInteger(userId),
                new BigInteger(request.getChannelId()));

            responseObserver.onNext(channel);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void updateChannel(UpdateChannelRequest request,
                           StreamObserver<Channel> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            Channel channel = coreClient.updateChannel(new CoreUpdateChannelRequest(userId, request));

            responseObserver.onNext(channel);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }


    @Override
    public void deleteChannel(ChannelInfoReq request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            coreClient.deleteChannel(new BigInteger(userId), new BigInteger(request.getChannelId()));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Channel deleted successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }


    @Override
    public void getMessages(MessageBucketReq request, StreamObserver<MessageList> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getReq().getToken());
            List<Message> messages = coreClient.getMessages(new CoreGetMessagesRequest(userId, request));
            MessageList messageList = MessageList.newBuilder().addAllMessages(messages).build();

            responseObserver.onNext(messageList);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }


    @Override
    public void createMessage(CreateMessageReq request, StreamObserver<Message> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getReq().getToken());
            Message message = coreClient.createMessage(new CoreCreateMessageRequest(userId, request));

            responseObserver.onNext(message);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void deleteMessage(MessageReq request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getReq().getToken());
            coreClient.deleteMessage(new BigInteger(userId),
                new BigInteger(request.getMessageReq().getMessageId()));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Message deleted successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
        catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Unexpected server error: " + e.getMessage())
                            .withCause(e)
                            .asRuntimeException()
            );
        }
    }
}
