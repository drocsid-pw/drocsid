package com.drocsid.grpc.mock_classes;

import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.proto.CreateUserRequest;
import com.drocsid.grpc.proto.GuildUser;
import org.springframework.stereotype.Component;
import com.drocsid.grpc.proto.*;

import java.util.List;

@Component
public class CoreClient {

    private final UserServiceGrpc.UserServiceBlockingStub userStub;
    private final GuildServiceGrpc.GuildServiceBlockingStub guildStub;
    private final ChannelServiceGrpc.ChannelServiceBlockingStub channelStub;

    public CoreClient(UserServiceGrpc.UserServiceBlockingStub userStub,
                      GuildServiceGrpc.GuildServiceBlockingStub guildStub,
                      ChannelServiceGrpc.ChannelServiceBlockingStub channelStub) {
        this.userStub = userStub;
        this.guildStub = guildStub;
        this.channelStub = channelStub;
    }

    public Guild createGuild(CreateGuildRequest request) {
        return guildStub.createGuild(request);
    }

    public Guild getGuild(GuildInfoReq request) {
        return guildStub.getGuild(request);
    }

    public Guild updateGuild(UpdateGuildRequest request) {
        return guildStub.updateGuild(request);
    }

    public void deleteGuild(GuildInfoReq request) {
        guildStub.deleteGuild(request);
    }

    public List<Guild> getAllGuilds(UserId userId) {
        return guildStub.getAllGuilds(userId).getGuildsList();
    }
    public List<Channel> getAllChannels(GuildInfoReq request) {
        return guildStub.getAllChannels(request).getChannelsList();
    }

    public Role getRole(RoleReq request) {
        return guildStub.getRole(request);
    }

    public Role createRole(CreateRoleReq request) {
        return guildStub.createRole(request);
    }

    public List<Role> getRoles(GuildInfoReq request) {
        return guildStub.getRoles(request).getRolesList();
    }

    public Role updateRole(UpdateRoleReq request) {
        return guildStub.updateRole(request);
    }

    public Channel createChannel(CreateChannelRequest request) {
        return guildStub.createChannel(request);
    }

    public GuildUser addUser(AddUser request) {
        return guildStub.addUser(request);
    }

    public GuildUser updateGuildUser(UpdateUserReq request) {
        return guildStub.updateUser(request);
    }

    public GuildUser getGuildUser(GuildUserReq request) {
        return guildStub.getUser(request);
    }

    public List<GuildUser> getGuildUsers(GuildInfoReq request) {
        return guildStub.getUsers(request).getGuildUsersList();
    }

    public void deleteGuildUser(GuildUserReq request) {
        guildStub.deleteUser(request);
    }

    public Channel getChannel(ChannelInfoReq request) {
        return channelStub.getChannel(request);
    }

    public Channel updateChannel(UpdateChannelRequest request) {
        return channelStub.updateChannel(request);
    }

    public void deleteChannel(ChannelInfoReq request) {
        channelStub.deleteChannel(request);
    }

    public List<Message> getMessages(MessageBucketReq request) {
        return channelStub.getMessages(request).getMessagesList();
    }

    public Message createMessage(CreateMessageReq request) {
        return channelStub.createMessage(request);
    }

    public void deleteMessage(MessageReq request) {
        channelStub.deleteMessage(request);
    }

    public User createUser(CreateUserRequest request) {
        return userStub.createUser(request);
    }

    public User getUser(UserId userId) {
        return userStub.getUser(userId);
    }

    public User updateUser(UpdateUserRequest request) {
        return userStub.updateUser(request);
    }

    public void deleteUser(UserId userId) {
        userStub.deleteUser(userId);
    }
}
