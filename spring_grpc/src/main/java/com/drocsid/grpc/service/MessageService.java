package com.drocsid.grpc.service;

import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class MessageService extends MessageServiceGrpc.MessageServiceImplBase {
    private final CoreClient coreClient;

    public MessageService(CoreClient coreClient) {
        this.coreClient = coreClient;
    }

    @Override
    public void createMessage(CreateMessageRequest request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.createMessage(request);

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
    public void getMessage(MessageId messageId, StreamObserver<Message> responseObserver) {
        try {
            Message message = coreClient.getMessage(messageId.getUserId(), messageId.getId());

            responseObserver.onNext(message);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void updateMessage(UpdateMessageRequest request,
                           StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.updateMessage(request);

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Message updated successfully.")
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
            coreClient.deleteMessage(messageId.getUserId(), messageId.getId());

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
}
