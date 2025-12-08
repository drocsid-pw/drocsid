package com.drocsid.grpc.service;

import com.drocsid.grpc.core_requests.guild.CoreCreateChannelRequest;
import com.drocsid.grpc.core_requests.guild.CoreUpdateGuildRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import com.drocsid.grpc.proto.UpdateGuildRequest;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigInteger;
import java.util.List;

@GrpcService
public class GuildService extends GuildServiceGrpc.GuildServiceImplBase {

    private final CoreClient coreClient;

    public GuildService(CoreClient coreClient) {
        this.coreClient = coreClient;
    }

    @Override
    public void getGuild(GuildId guildId, StreamObserver<Guild> responseObserver) {
        try {
            Guild guild = coreClient.getGuild(new BigInteger(guildId.getUserId()),
                    new BigInteger(guildId.getId()));

            responseObserver.onNext(guild);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void updateGuild(UpdateGuildRequest request,
                              StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.updateGuild(new CoreUpdateGuildRequest(request));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Guild updated successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void deleteGuild(GuildId guildId, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.deleteGuild(new BigInteger(guildId.getUserId()), new BigInteger(guildId.getId()));

            ResponseMessage response = ResponseMessage
                    .newBuilder()
                    .setText("Guild deleted successfully.")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void getAllGuilds(UserId userId, StreamObserver<GuildList> responseObserver) {
        try {
            List<Guild> guilds = coreClient.getAllGuilds(new BigInteger(userId.getId()));
            GuildList list = GuildList.newBuilder().addAllGuilds(guilds).build();
            responseObserver.onNext(list);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
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
    public void deleteChannel(DeleteChannelRequest request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            coreClient.deleteChannel(new BigInteger(request.getUserId()), new BigInteger(request.getId()));

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
    public void getAllChannels(GuildId guildId, StreamObserver<ChannelList> responseObserver) {
        try {
            List<Channel> channels = coreClient.getAllChannels(new BigInteger(guildId.getUserId()),
                    new BigInteger(guildId.getId()));

            ChannelList list = ChannelList.newBuilder().addAllChannels(channels).build();
            responseObserver.onNext(list);
            responseObserver.onCompleted();

        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void addUser(GuildUserInfo guildUserInfo, StreamObserver<ResponseMessage> responseObserver) {
        try {
            System.out.println("2");
        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void removeUser(GuildUserInfo guildUserInfo, StreamObserver<ResponseMessage> responseObserver) {
        try {
            System.out.println("2");
        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void editUserPermission(GuildEditUserRequest request, StreamObserver<ResponseMessage> responseObserver) {
        try {
            System.out.println("2");
        }
        catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}
