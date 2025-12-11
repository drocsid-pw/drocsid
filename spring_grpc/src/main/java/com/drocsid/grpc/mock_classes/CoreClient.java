package com.drocsid.grpc.mock_classes;

import com.drocsid.grpc.core_requests.channel.CoreGetMessagesRequest;
import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.core_requests.guild.CoreCreateGuildRequest;
import com.drocsid.grpc.core_requests.channel.CoreCreateMessageRequest;
import com.drocsid.grpc.core_requests.channel.CoreUpdateChannelRequest;
import com.drocsid.grpc.core_requests.channel.CoreUpdateMessageRequest;
import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.proto.CreateUserRequest;
import com.drocsid.grpc.proto.GuildUser;
import org.springframework.stereotype.Component;
import com.drocsid.grpc.proto.*;

import java.math.BigInteger;
import java.util.List;

@Component
public class CoreClient {

    public User createUser(CreateUserRequest request) {
        return User.newBuilder()
                .setId("1")
                .setName("Mock User")
                .setAvatarHash("hash")
                .build();
    }

    public User getUser(BigInteger id) {
        return User.newBuilder()
                .setId(id.toString())
                .setName("Mock User")
                .setAvatarHash("hash")
                .build();
    }

    public GuildUser getGuildUser(CoreGetGuildUserRequest request) {
        return GuildUser.newBuilder().build();
    }

    public User updateUser(CoreUpdateUserRequest request) {return User.newBuilder().build();}

    public GuildUser updateGuildUser(CoreUpdateGuildUserRequest request) {return GuildUser.newBuilder().build();}

    public void deleteUser(BigInteger userId) {}

    public List<GuildUser> getGuildUsers(CoreGetGuildUsersRequest request) {
        return List.of();
    }

    public List<Guild> getAllUserGuilds(BigInteger userId) {return List.of();}

    public Message createMessage(CoreCreateMessageRequest request) {
        return Message.newBuilder()
                .setMessageId("id")
                .setAuthor(GuildUser.newBuilder().build())
                .setContent("content")
                .build();
    }

    public void updateMessage(CoreUpdateMessageRequest request) {}

    public void deleteMessage(BigInteger userId, BigInteger messageId) {}

    public Channel createChannel(CoreCreateChannelRequest request) {
        return Channel.newBuilder().build();
    }

    public Channel getChannel(BigInteger userId, BigInteger channelId) {
        return Channel.newBuilder()
                .setChannelId(channelId.toString())
                .setName("name")
                .setGuildId("id")
                .build();
    }

    public Channel updateChannel(CoreUpdateChannelRequest request) {
        return Channel.newBuilder()
                .setChannelId("2")
                .setName("name")
                .setGuildId("id")
                .build();
    }

    public void deleteChannel(BigInteger userId, BigInteger channelId) {}

    public List<Message> getMessages(CoreGetMessagesRequest request) { return List.of(); }

    public Guild createGuild(CoreCreateGuildRequest request) {return Guild.newBuilder().build();}

    public Guild getGuild(CoreGetGuildRequest request) {
        return Guild.newBuilder().build();
    }

    public Guild updateGuild(CoreUpdateGuildRequest request) {return Guild.newBuilder().build();}

    public void changeGuildOwner(CoreChangeGuildOwnerRequest request) {}

    public void deleteGuild(BigInteger userId, BigInteger guildId) {}

    public List<Guild> getAllGuilds(BigInteger userId) {
        return List.of();
    }

    public GuildUser addUser(CoreAddUserRequest request) { return GuildUser.newBuilder().build();}

    public void sendInvitationToUser(CoreSendInvitationToUserRequest request) {}

    public void editUserPermissions(CoreEditUserPermissionInGuildRequest request) {}

    public List<Channel> getAllChannels(CoreGetAllChannelsRequest request) {
        return List.of();
    }

    public void deleteGuildUser(CoreDeleteGuildUserRequest request) {}
}
