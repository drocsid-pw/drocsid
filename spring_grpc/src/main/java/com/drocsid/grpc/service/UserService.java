package com.drocsid.grpc.service;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.CreateUserRequest;
import com.drocsid.grpc.proto.UpdateUserRequest;
import com.drocsid.grpc.proto.Empty;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import com.drocsid.grpc.proto.UserServiceGrpc;

import com.drocsid.grpc.proto.User;
import com.drocsid.grpc.proto.UserId;
import com.drocsid.grpc.proto.ResponseMessage;
import com.drocsid.grpc.proto.UserList;

import java.util.List;

@GrpcService
public class UserService extends UserServiceGrpc.UserServiceImplBase {

    private final CoreClient coreClient;

    public UserService(CoreClient coreClient) {
        this.coreClient = coreClient;
    }

    @Override
    public void createUser(CreateUserRequest request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.createUser(request);

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("User created successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void getUser(UserId userId, StreamObserver<User> responseObserver) {
        try {
            User user = coreClient.getUser(userId.getId());

            responseObserver.onNext(user);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void updateUser(UpdateUserRequest request,
                           StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.updateUser(request);

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("User updated successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void deleteUser(UserId userId, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.deleteUser(userId.getId());

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("User deleted successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void listUsers(Empty request, StreamObserver<UserList> responseObserver) {
        try {
            List<User> users = coreClient.listUsers();

            UserList list = UserList.newBuilder().addAllUsers(users).build();
            responseObserver.onNext(list);
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}
