package com.drocsid.grpc.service;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.core_requests.guild.CoreCreateGuildRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import com.drocsid.grpc.proto.UpdateGuildRequest;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigInteger;
import java.util.List;

@GrpcService
public class GuildService extends GuildServiceGrpc.GuildServiceImplBase {

    private final CoreClient coreClient;
    public final JwtAuthService jwtAuthService;

    public GuildService(CoreClient coreClient, JwtAuthService jwtAuthService) {
        this.coreClient = coreClient;
        this.jwtAuthService = jwtAuthService;
    }

    @Override
    public void createGuild(CreateGuildRequest request, StreamObserver<Guild> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            Guild guild = coreClient.createGuild(new CoreCreateGuildRequest(userId, request));

            responseObserver.onNext(guild);
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
    public void getGuild(GuildInfoReq request, StreamObserver<Guild> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            Guild guild = coreClient.getGuild(new CoreGetGuildRequest(userId, request));

            responseObserver.onNext(guild);
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
    public void updateGuild(UpdateGuildRequest request, StreamObserver<Guild> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            Guild guild = coreClient.updateGuild(new CoreUpdateGuildRequest(userId, request));

            responseObserver.onNext(guild);
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
    public void deleteGuild(GuildInfoReq request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            coreClient.deleteGuild(new BigInteger(userId), new BigInteger(request.getGuildId()));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Guild deleted successfully.")
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
    public void getAllGuilds(UserId userIdObj, StreamObserver<GuildList> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(userIdObj.getToken());
            List<Guild> guilds = coreClient.getAllGuilds(new BigInteger(userId));
            GuildList list = GuildList.newBuilder().addAllGuilds(guilds).build();
            responseObserver.onNext(list);
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
    public void getAllChannels(GuildInfoReq request, StreamObserver<ChannelList> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            List<Channel> channels = coreClient.getAllChannels(new CoreGetAllChannelsRequest(userId,
                request));

            ChannelList list = ChannelList.newBuilder().addAllChannels(channels).build();
            responseObserver.onNext(list);
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
    public void createChannel(CreateChannelRequest request, StreamObserver<Channel> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            Channel channel = coreClient.createChannel(new CoreCreateChannelRequest(userId, request));

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
    public void addUser(AddUser addUserObj, StreamObserver<GuildUser> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(addUserObj.getToken());
            GuildUser guildUser = coreClient.addUser(new CoreAddUserRequest(userId, addUserObj));

            responseObserver.onNext(guildUser);
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
    public void updateUser(UpdateUserReq request, StreamObserver<GuildUser> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            GuildUser guildUser = coreClient.updateGuildUser(new CoreUpdateGuildUserRequest(userId, request));

            responseObserver.onNext(guildUser);
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
    public void getUser(GuildUserReq request, StreamObserver<GuildUser> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            GuildUser guildUser = coreClient.getGuildUser(new CoreGetGuildUserRequest(userId,
                request));

            responseObserver.onNext(guildUser);
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
    public void getUsers(GuildInfoReq request, StreamObserver<GuildUserList> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            List<GuildUser> guildUsers = coreClient.getGuildUsers(new CoreGetGuildUsersRequest(userId,
                    request));
            GuildUserList guildUserList = GuildUserList.newBuilder().addAllGuildUsers(guildUsers).build();

            responseObserver.onNext(guildUserList);
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
    public void deleteUser(GuildUserReq request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            String userId = jwtAuthService.checkAuth(request.getToken());
            coreClient.deleteGuildUser(new CoreDeleteGuildUserRequest(userId, request));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("User removed successfully.")
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
