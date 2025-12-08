package com.drocsid.grpc.mock_classes;

import com.drocsid.grpc.core_requests.guild.CoreCreateChannelRequest;
import com.drocsid.grpc.core_requests.user.CoreCreateGuildRequest;
import com.drocsid.grpc.core_requests.channel.CoreCreateMessageRequest;
import com.drocsid.grpc.core_requests.channel.CoreUpdateChannelRequest;
import com.drocsid.grpc.core_requests.guild.CoreUpdateGuildRequest;
import com.drocsid.grpc.core_requests.channel.CoreUpdateMessageRequest;
import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.proto.CreateUserRequest;
import org.springframework.stereotype.Component;
import com.drocsid.grpc.proto.*;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

@Component
public class CoreClient {

    public void createUser(CreateUserRequest request) {}

    public User getUser(BigInteger id) {
        return User.newBuilder()
                .setId(id.toString())
                .setName("Mock User")
                .setAvatarLetter("M")
                .setAvatarHash("hash")
                .build();
    }

    public void updateUser(CoreUpdateUserRequest request) {}

    public void deleteUser(BigInteger userId) {}

    public List<User> getAllUsers() {
        return List.of();
    }

    public List<Guild> getAllUserGuilds(BigInteger userId) {return List.of();}

    public void createMessage(CoreCreateMessageRequest request) {}

    public Message getMessage(BigInteger userId, BigInteger messageId) {
        return Message.newBuilder()
                .setId(messageId.toString())
                .setAuthorId("id")
                .setAuthorName("name")
                .setContent("content")
                .setChannelId("channelId")
                .build();
    }

    public void updateMessage(CoreUpdateMessageRequest request) {}

    public void deleteMessage(BigInteger userId, BigInteger messageId) {}

    public void createChannel(CoreCreateChannelRequest request) {}

    public Channel getChannel(BigInteger userId, BigInteger channelId) {
        return Channel.newBuilder()
                .setId(channelId.toString())
                .setName("name")
                .addAllMessages(new ArrayList<>())
                .setGuildId("id")
                .build();
    }

    public void updateChannel(CoreUpdateChannelRequest request) {}

    public void deleteChannel(BigInteger userId, BigInteger channelId) {}

    public Message getLastMessage(BigInteger userId, BigInteger channelId) {
        return Message.newBuilder()
                .setId("id")
                .setAuthorId("id")
                .setAuthorName("name")
                .setContent("content")
                .setChannelId("channelId")
                .build();
    }

    public List<Message> getAllMessages(BigInteger userId, BigInteger channelId) {
        return List.of();
    }

    public void createGuild(CoreCreateGuildRequest request) {}

    public Guild getGuild(BigInteger userId, BigInteger guildId) {
        return Guild.newBuilder()
                .setId(guildId.toString())
                .setName("name")
                .setIcon("icon")
                .setOwnerId("id")
                .addAllChannels(new ArrayList<>())
                .build();
    }

    public void updateGuild(CoreUpdateGuildRequest request) {}

    public void deleteGuild(BigInteger userId, BigInteger guildId) {}

    public List<Guild> getAllGuilds(BigInteger userId) {
        return List.of();
    }

    public List<Channel> getAllChannels(BigInteger userId, BigInteger guildId) {
        return List.of();
    }
}
