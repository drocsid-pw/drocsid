package com.drocsid.grpc.service;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.channel.CoreUpdateMessageRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigInteger;

@GrpcService
public class MessageService extends MessageServiceGrpc.MessageServiceImplBase {
    private final CoreClient coreClient;
    private final JwtAuthService jwtAuthService;

    public MessageService(CoreClient coreClient, JwtAuthService jwtAuthService) {
        this.coreClient = coreClient;
        this.jwtAuthService = jwtAuthService;
    }



    @Override
    public void getMessage(MessageId messageId, StreamObserver<Message> responseObserver) {
        try {
            Message message = coreClient.getMessage(new BigInteger(messageId.getUserId()),
                new BigInteger(messageId.getId()));

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
            coreClient.updateMessage(new CoreUpdateMessageRequest(request));

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
    
    // Mockup function demonstrating JWT validation.
    public void mockupAuthDemo(Message message) {
        try {
            // Validate JWT and get userId
            String authenticatedUserId = jwtAuthService.checkAuth(message.getJwt());
            
        } catch (Exception e) {
            System.out.println("Authentication failed: " + e.getMessage());
        }
    }
}
