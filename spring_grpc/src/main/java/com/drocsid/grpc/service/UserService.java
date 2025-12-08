package com.drocsid.grpc.service;
import com.drocsid.grpc.core_requests.user.CoreCreateGuildRequest;
import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigInteger;
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
            User user = coreClient.getUser(new BigInteger(userId.getId()));

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
            coreClient.updateUser(new CoreUpdateUserRequest(request));

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
            coreClient.deleteUser(new BigInteger(userId.getId()));

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
    public void getAllUsers(Empty request, StreamObserver<UserList> responseObserver) {
        try {
            List<User> users = coreClient.getAllUsers();

            UserList list = UserList.newBuilder().addAllUsers(users).build();
            responseObserver.onNext(list);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void createGuild(CreateGuildRequest request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.createGuild(new CoreCreateGuildRequest(request));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Guild created successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void getAllUserGuilds(UserId userId, StreamObserver<GuildList> responseObserver) {
        try {
            List<Guild> guilds = coreClient.getAllUserGuilds(new BigInteger(userId.getId()));

            GuildList list = GuildList.newBuilder().addAllGuilds(guilds).build();
            responseObserver.onNext(list);
            responseObserver.onCompleted();
        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}
