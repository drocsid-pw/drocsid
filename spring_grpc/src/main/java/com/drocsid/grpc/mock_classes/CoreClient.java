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

    public Guild createGuild(CoreCreateGuildRequest request) { return Guild.newBuilder()
            .setOwnerId("1")
            .setIcon("1")
            .setGuildId("1")
            .setName("Guild1")
            .addRoles(Role.newBuilder().setGuildRoleId("123").setRoleName("Admin").setPermissions("ALL").build())
            .addRoles(Role.newBuilder().setGuildRoleId("456").setRoleName("Member").setPermissions("READ").build())
            .build(); }

    public Guild getGuild(CoreGetGuildRequest request) { return Guild.newBuilder()
            .setOwnerId("1")
            .setIcon("1")
            .setGuildId("1")
            .setName("Guild1")
            .addRoles(Role.newBuilder().setGuildRoleId("123").setRoleName("Admin").setPermissions("ALL").build())
            .addRoles(Role.newBuilder().setGuildRoleId("456").setRoleName("Member").setPermissions("READ").build())
            .build(); }

    public Guild updateGuild(CoreUpdateGuildRequest request) { return Guild.newBuilder()
            .setOwnerId("1")
            .setIcon("1")
            .setGuildId("1")
            .setName("Guild1")
            .addRoles(Role.newBuilder().setGuildRoleId("123").setRoleName("Admin").setPermissions("ALL").build())
            .addRoles(Role.newBuilder().setGuildRoleId("456").setRoleName("Member").setPermissions("READ").build())
            .build(); }

    public void deleteGuild(CoreDeleteGuildRequest request) {}

    public List<Guild> getAllGuilds(BigInteger userId) {
        return List.of(Guild.newBuilder()
                .setOwnerId("1")
                .setIcon("1")
                .setGuildId("1")
                .setName("Guild1")
                .addRoles(Role.newBuilder().setGuildRoleId("123").setRoleName("Admin").setPermissions("ALL").build())
                .addRoles(Role.newBuilder().setGuildRoleId("456").setRoleName("Member").setPermissions("READ").build())
                .build());
    }

    public List<Channel> getAllChannels(CoreGetAllChannelsRequest request) {
        return List.of(Channel.newBuilder().setChannelId("1").setGuildId("1").setName("Channel1").build());
    }

    public Role getRole(CoreGetRoleRequest request) { return Role.newBuilder().setRoleName("role1").setPermissions("11111").setGuildRoleId("1").build(); }

    public Role createRole(CoreCreateRoleRequest request) { return Role.newBuilder().setRoleName("role1").setPermissions("11111").setGuildRoleId("1").build(); }

    public List<Role> getRoles(CoreGetRolesRequest request) { return List.of(Role.newBuilder().setRoleName("role1").setPermissions("11111").setGuildRoleId("1").build()); }

    public Role updateRole(CoreUpdateRoleRequest request) { return Role.newBuilder().setRoleName("role1").setPermissions("11111").setGuildRoleId("1").build(); }

    public Channel createChannel(CoreCreateChannelRequest request) { return Channel.newBuilder().setChannelId("1").setGuildId("1").setName("Channel1").build(); }

    public GuildUser addUser(CoreAddUserRequest request) { return GuildUser.newBuilder()
            .setGuildUserId("1")
            .setNick("nick")
            .setRoles(
                    RoleList.newBuilder()
                            .addRoles(Role.newBuilder()
                                    .setGuildRoleId("1")
                                    .setRoleName("role1")
                                    .setPermissions("11111")
                                    .build())
                            .build()
            )
            .build();}

    public GuildUser updateGuildUser(CoreUpdateGuildUserRequest request) { return GuildUser.newBuilder()
            .setGuildUserId("1")
            .setNick("nick")
            .setRoles(
                    RoleList.newBuilder()
                            .addRoles(Role.newBuilder()
                                    .setGuildRoleId("1")
                                    .setRoleName("role1")
                                    .setPermissions("11111")
                                    .build())
                            .build()
            )
            .build(); }

    public GuildUser getGuildUser(CoreGetGuildUserRequest request) { return GuildUser.newBuilder()
            .setGuildUserId("1")
            .setNick("nick")
            .setRoles(
                    RoleList.newBuilder()
                            .addRoles(Role.newBuilder()
                                    .setGuildRoleId("1")
                                    .setRoleName("role1")
                                    .setPermissions("11111")
                                    .build())
                            .build()
            )
            .build(); }

    public List<GuildUser> getGuildUsers(CoreGetGuildUsersRequest request) {
        return List.of(GuildUser.newBuilder()
                .setGuildUserId("1")
                .setNick("nick")
                .setRoles(
                        RoleList.newBuilder()
                                .addRoles(Role.newBuilder()
                                        .setGuildRoleId("1")
                                        .setRoleName("role1")
                                        .setPermissions("11111")
                                        .build())
                                .build()
                )
                .build());
    }

    public void deleteGuildUser(CoreDeleteGuildUserRequest request) {}

    public Channel getChannel(CoreGetChannelRequest request) { return Channel.newBuilder().setChannelId("1").setGuildId("1").setName("Channel1").build(); }

    public Channel updateChannel(CoreUpdateChannelRequest request) { return Channel.newBuilder().setChannelId("1").setGuildId("1").setName("Channel1").build(); }

    public void deleteChannel(CoreDeleteChannelRequest request) {}

    public List<Message> getMessages(CoreGetMessagesRequest request) { return List.of(); }

    public Message createMessage(CoreCreateMessageRequest request) { return Message.newBuilder().setMessageId("1").setContent("message").setAuthor(GuildUser.newBuilder()
            .setGuildUserId("1")
            .setNick("nick")
            .setRoles(
                    RoleList.newBuilder()
                            .addRoles(Role.newBuilder()
                                    .setGuildRoleId("1")
                                    .setRoleName("role1")
                                    .setPermissions("11111")
                                    .build())
                            .build()
            )
            .build()).build(); }

    public void deleteMessage(CoreDeleteMessageRequest request) {}

    public User createUser(CreateUserRequest request) { return User.newBuilder().setId("1").setName("Bob").setAvatarHash("1234").build(); }

    public User getUser(BigInteger id) { return User.newBuilder().setId("1").setName("Bob").setAvatarHash("1234").build(); }

    public User updateUser(CoreUpdateUserRequest request) { return User.newBuilder().setId("1").setName("Bob").setAvatarHash("1234").build(); }

    public void deleteUser(BigInteger userId) {}
}
