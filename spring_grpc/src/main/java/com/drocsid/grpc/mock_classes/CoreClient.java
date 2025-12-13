package com.drocsid.grpc.mock_classes;

import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.core_requests.guild.CoreCreateGuildRequest;
import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.proto.CreateUserRequest;
import com.drocsid.grpc.proto.GuildUser;
import org.springframework.stereotype.Component;
import com.drocsid.grpc.proto.*;

import java.math.BigInteger;
import java.util.List;

@Component
public class CoreClient {

    public Guild createGuild(CoreCreateGuildRequest request) { return Guild.newBuilder().build(); }

    public Guild getGuild(CoreGetGuildRequest request) { return Guild.newBuilder().build(); }

    public Guild updateGuild(CoreUpdateGuildRequest request) { return Guild.newBuilder().build(); }

    public void deleteGuild(CoreDeleteGuildRequest request) {}

    public List<Guild> getAllGuilds(BigInteger userId) {
        return List.of();
    }

    public List<Channel> getAllChannels(CoreGetAllChannelsRequest request) {
        return List.of();
    }

    public Role getRole(CoreGetRoleRequest request) { return Role.newBuilder().build(); }

    public Role createRole(CoreCreateRoleRequest request) { return Role.newBuilder().build(); }

    public List<Role> getRoles(CoreGetRolesRequest request) { return List.of(); }

    public Role updateRole(CoreUpdateRoleRequest request) { return Role.newBuilder().build(); }

    public Channel createChannel(CoreCreateChannelRequest request) { return Channel.newBuilder().build(); }

    public GuildUser addUser(CoreAddUserRequest request) { return GuildUser.newBuilder().build(); }

    public GuildUser updateGuildUser(CoreUpdateGuildUserRequest request) {return GuildUser.newBuilder().build();}

    public GuildUser getGuildUser(CoreGetGuildUserRequest request) { return GuildUser.newBuilder().build(); }

    public List<GuildUser> getGuildUsers(CoreGetGuildUsersRequest request) {
        return List.of();
    }

    public void deleteGuildUser(CoreDeleteGuildUserRequest request) {}

    public Channel getChannel(CoreGetChannelRequest request) { return Channel.newBuilder().build(); }

    public Channel updateChannel(CoreUpdateChannelRequest request) { return Channel.newBuilder().build(); }

    public void deleteChannel(CoreDeleteChannelRequest request) {}

    public List<Message> getMessages(CoreGetMessagesRequest request) { return List.of(); }

    public Message createMessage(CoreCreateMessageRequest request) { return Message.newBuilder().build(); }

    public void deleteMessage(CoreDeleteMessageRequest request) {}

    public User createUser(CreateUserRequest request) { return User.newBuilder().build(); }

    public User getUser(BigInteger id) { return User.newBuilder().build(); }

    public User updateUser(CoreUpdateUserRequest request) { return User.newBuilder().build(); }

    public void deleteUser(BigInteger userId) {}
}
