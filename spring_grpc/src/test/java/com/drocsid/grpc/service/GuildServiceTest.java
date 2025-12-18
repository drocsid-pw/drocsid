package com.drocsid.grpc.service;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GuildServiceTest {

    private CoreClient coreClient;
    private GuildService guildService;
    private JwtAuthService jwtAuthService;

    @BeforeEach
    void setUp() {
        coreClient = mock(CoreClient.class);
        jwtAuthService = mock(JwtAuthService.class);

        when(jwtAuthService.checkAuth(any())).thenReturn("1");
        guildService = new GuildService(coreClient, jwtAuthService);
    }

    @Test
    void testCreateGuild() {
        CreateGuildRequest request = CreateGuildRequest.newBuilder().build();

        TestObserver<Guild> observer = new TestObserver<>();
        Guild returnedGuild = Guild.newBuilder().build();
        when(coreClient.createGuild(any(CoreCreateGuildRequest.class)))
                .thenReturn(returnedGuild);

        guildService.createGuild(request, observer);

        verify(coreClient).createGuild(new CoreCreateGuildRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Guild.class, observer.value);
    }

    @Test
    void testCreateGuildException() {
        CreateGuildRequest request = CreateGuildRequest.newBuilder().build();

        doThrow(new RuntimeException("error")).when(coreClient).createGuild(any());

        TestObserver<Guild> observer = new TestObserver<>();
        guildService.createGuild(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetGuild() {
        GuildInfoReq request = GuildInfoReq.newBuilder().setToken("token").setGuildId("1").build();

        TestObserver<Guild> observer = new TestObserver<>();
        Guild returnedGuild = Guild.newBuilder().build();
        when(coreClient.getGuild(any(CoreGetGuildRequest.class)))
                .thenReturn(returnedGuild);

        guildService.getGuild(request, observer);

        verify(coreClient).getGuild(new CoreGetGuildRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Guild.class, observer.value);
    }

    @Test
    void testGetGuildException() {
        when(coreClient.getGuild(any())).thenThrow(new RuntimeException("error"));

        TestObserver<Guild> observer = new TestObserver<>();
        GuildInfoReq request = GuildInfoReq.newBuilder().setToken("token").setGuildId("1").build();

        guildService.getGuild(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testUpdateGuild() {
        UpdateGuildRequest request = UpdateGuildRequest
                .newBuilder()
                .setToken("token")
                .setGuild(Guild
                        .newBuilder()
                        .setGuildId("1")
                        .setName("name")
                        .setIcon("icon")
                        .setOwnerId("1")
                        .build())
                .build();

        Guild returnedGuild = Guild.newBuilder().build();
        when(coreClient.updateGuild(any(CoreUpdateGuildRequest.class)))
                .thenReturn(returnedGuild);
        TestObserver<Guild> observer = new TestObserver<>();
        guildService.updateGuild(request, observer);

        verify(coreClient).updateGuild(new CoreUpdateGuildRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Guild.class, observer.value);
    }

    @Test
    void testUpdateGuildException() {
        UpdateGuildRequest request = UpdateGuildRequest.newBuilder().build();

        doThrow(new RuntimeException("error")).when(coreClient).updateGuild(any());

        TestObserver<Guild> observer = new TestObserver<>();
        guildService.updateGuild(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteGuild() {
        GuildInfoReq request = GuildInfoReq.newBuilder().setToken("token").setGuildId("1").build();
        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.deleteGuild(request, observer);

        verify(coreClient).deleteGuild(new CoreDeleteGuildRequest("1", request));
        assertTrue(observer.completed);
        assertEquals("Guild deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteGuildException() {
        doThrow(new RuntimeException("error")).when(coreClient)
                .deleteGuild(any());

        GuildInfoReq request = GuildInfoReq.newBuilder().setToken("token").setGuildId("1").build();
        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.deleteGuild(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetAllGuilds() {
        when(coreClient.getAllGuilds(new BigInteger("1"))).thenReturn(List.of());

        TestObserver<GuildList> observer = new TestObserver<>();
        UserId userId = UserId.newBuilder().build();

        guildService.getAllGuilds(userId, observer);

        verify(coreClient).getAllGuilds(new BigInteger("1"));
        assertTrue(observer.completed);
        assertInstanceOf(GuildList.class, observer.value);
    }

    @Test
    void testGetAllGuildsException() {
        doThrow(new RuntimeException("error")).when(coreClient).getAllGuilds(new BigInteger("1"));

        TestObserver<GuildList> observer = new TestObserver<>();
        UserId userId = UserId.newBuilder().build();

        guildService.getAllGuilds(userId, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetAllChannels() {
        TestObserver<ChannelList> observer = new TestObserver<>();
        GuildInfoReq request = GuildInfoReq
                .newBuilder()
                .setToken("token")
                .setGuildId("1")
                .build();

        guildService.getAllChannels(request, observer);

        verify(coreClient).getAllChannels(new CoreGetAllChannelsRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(ChannelList.class, observer.value);
    }

    @Test
    void testGetAllChannelsException() {
        doThrow(new RuntimeException("error")).when(coreClient).getAllChannels(any());

        TestObserver<ChannelList> observer = new TestObserver<>();
        GuildInfoReq request = GuildInfoReq.newBuilder().build();

        guildService.getAllChannels(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetRole() {
        RoleReq request = RoleReq.newBuilder().setToken("token").setGuildId("1").setGuildRoleId("1").build();

        Role returnedRole = Role.newBuilder().build();
        when(coreClient.getRole(any(CoreGetRoleRequest.class)))
                .thenReturn(returnedRole);
        TestObserver<Role> observer = new TestObserver<>();

        guildService.getRole(request, observer);

        verify(coreClient).getRole(new CoreGetRoleRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Role.class, observer.value);
    }

    @Test
    void testGetRoleException() {
        doThrow(new RuntimeException("error")).when(coreClient).getRole(any());

        TestObserver<Role> observer = new TestObserver<>();
        RoleReq request = RoleReq.newBuilder().setToken("token").setGuildId("1").setGuildRoleId("1").build();

        guildService.getRole(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testCreateRole() {
        CreateRoleReq request = CreateRoleReq
                .newBuilder()
                .setToken("token")
                .setGuildId("1")
                .build();

        Role returnedRole = Role.newBuilder().build();
        when(coreClient.createRole(any(CoreCreateRoleRequest.class)))
                .thenReturn(returnedRole);
        TestObserver<Role> observer = new TestObserver<>();

        guildService.createRole(request, observer);

        verify(coreClient).createRole(new CoreCreateRoleRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Role.class, observer.value);
    }

    @Test
    void testCreateRoleException() {
        doThrow(new RuntimeException("error")).when(coreClient).createRole(any());

        TestObserver<Role> observer = new TestObserver<>();
        CreateRoleReq request = CreateRoleReq.newBuilder().build();

        guildService.createRole(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetRoles() {
        GuildInfoReq request = GuildInfoReq.newBuilder().setToken("token").setGuildId("1").build();

        TestObserver<RoleList> observer = new TestObserver<>();

        guildService.getRoles(request, observer);

        verify(coreClient).getRoles(new CoreGetRolesRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(RoleList.class, observer.value);
    }

    @Test
    void testGetRolesException() {
        doThrow(new RuntimeException("error")).when(coreClient).getRole(any());

        TestObserver<RoleList> observer = new TestObserver<>();
        GuildInfoReq request = GuildInfoReq.newBuilder().build();

        guildService.getRoles(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testUpdateRole() {
        UpdateRoleReq request = UpdateRoleReq.newBuilder()
                .setGuildId("1")
                .setRole(Role
                        .newBuilder()
                        .setGuildRoleId("1")
                        .build())
                .build();

        Role returnedRole = Role.newBuilder().build();
        when(coreClient.updateRole(any(CoreUpdateRoleRequest.class)))
                .thenReturn(returnedRole);
        TestObserver<Role> observer = new TestObserver<>();

        guildService.updateRole(request, observer);

        verify(coreClient).updateRole(new CoreUpdateRoleRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Role.class, observer.value);
    }

    @Test
    void testUpdateRoleException() {
        doThrow(new RuntimeException("error")).when(coreClient).getRole(any());

        TestObserver<Role> observer = new TestObserver<>();
        UpdateRoleReq request = UpdateRoleReq.newBuilder()
                .setRole(Role
                        .newBuilder()
                        .setGuildRoleId("1")
                        .build())
                .build();

        guildService.updateRole(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testCreateChannel() {
        CreateChannelRequest request = CreateChannelRequest
                .newBuilder()
                .setToken("token")
                .setGuildId("1")
                .build();

        Channel returnedChannel = Channel.newBuilder().build();
        when(coreClient.createChannel(any(CoreCreateChannelRequest.class)))
                .thenReturn(returnedChannel);
        TestObserver<Channel> observer = new TestObserver<>();

        guildService.createChannel(request, observer);

        verify(coreClient).createChannel(new CoreCreateChannelRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Channel.class, observer.value);
    }

    @Test
    void testCreateChannelException() {
        CreateChannelRequest request = CreateChannelRequest.newBuilder().build();

        doThrow(new RuntimeException("error")).when(coreClient).createChannel(any());

        TestObserver<Channel> observer = new TestObserver<>();

        guildService.createChannel(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testAddUser() {
        AddUser addUserObj = AddUser.newBuilder().setToken("token").setGuildId("1").build();

        TestObserver<GuildUser> observer = new TestObserver<>();
        GuildUser returnedGuildUser = GuildUser.newBuilder().build();
        when(coreClient.addUser(any(CoreAddUserRequest.class)))
                .thenReturn(returnedGuildUser);

        guildService.addUser(addUserObj, observer);

        verify(coreClient).addUser(new CoreAddUserRequest("1", addUserObj));
        assertTrue(observer.completed);
        assertInstanceOf(GuildUser.class, observer.value);
    }

    @Test
    void testAddUserException() {
        AddUser addUserObj = AddUser.newBuilder().setToken("token").setGuildId("1").build();

        doThrow(new RuntimeException("error")).when(coreClient).addUser(any());

        TestObserver<GuildUser> observer = new TestObserver<>();

        guildService.addUser(addUserObj, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testUpdateUser() {
        UpdateUserReq request = UpdateUserReq
                .newBuilder()
                .setToken("token")
                .setGuildId("1")
                .setUser(GuildUser
                        .newBuilder()
                        .setGuildUserId("1")
                        .build())
                .build();

        GuildUser returnedGuildUser = GuildUser.newBuilder().build();
        when(coreClient.updateGuildUser(any(CoreUpdateGuildUserRequest.class)))
                .thenReturn(returnedGuildUser);
        TestObserver<GuildUser> observer = new TestObserver<>();

        guildService.updateUser(request, observer);

        verify(coreClient).updateGuildUser(new CoreUpdateGuildUserRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(GuildUser.class, observer.value);
    }

    @Test
    void testUpdateUserException() {
        UpdateUserReq request = UpdateUserReq.newBuilder().build();

        doThrow(new RuntimeException("error")).when(coreClient).addUser(any());

        TestObserver<GuildUser> observer = new TestObserver<>();

        guildService.updateUser(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetUser() {
        GuildUserReq request = GuildUserReq
                .newBuilder()
                .setToken("token")
                .setGuildId("1")
                .setGuildUserId("1")
                .build();

        GuildUser returnedGuildUser = GuildUser.newBuilder().build();
        when(coreClient.getGuildUser(any(CoreGetGuildUserRequest.class)))
                .thenReturn(returnedGuildUser);
        TestObserver<GuildUser> observer = new TestObserver<>();

        guildService.getUser(request, observer);

        verify(coreClient).getGuildUser(new CoreGetGuildUserRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(GuildUser.class, observer.value);
    }

    @Test
    void testGetUserException() {
        GuildUserReq request = GuildUserReq
                .newBuilder()
                .setToken("token")
                .setGuildId("1")
                .setGuildUserId("1")
                .build();


        doThrow(new RuntimeException("error")).when(coreClient).getGuildUser(any());

        TestObserver<GuildUser> observer = new TestObserver<>();

        guildService.getUser(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetUsers() {
        GuildInfoReq request = GuildInfoReq.newBuilder().setToken("token").setGuildId("1").build();

        TestObserver<GuildUserList> observer = new TestObserver<>();

        guildService.getUsers(request, observer);

        verify(coreClient).getGuildUsers(new CoreGetGuildUsersRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(GuildUserList.class, observer.value);
    }

    @Test
    void testGetUsersException() {
        GuildInfoReq request = GuildInfoReq.newBuilder().setToken("token").setGuildId("1").build();

        doThrow(new RuntimeException("error")).when(coreClient).getGuildUsers(any());

        TestObserver<GuildUserList> observer = new TestObserver<>();

        guildService.getUsers(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteUser() {
        GuildUserReq request = GuildUserReq
                .newBuilder()
                .setToken("token")
                .setGuildId("1")
                .setGuildUserId("1")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.deleteUser(request, observer);

        verify(coreClient).deleteGuildUser(new CoreDeleteGuildUserRequest("1", request));
        assertTrue(observer.completed);
        assertEquals("User deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteUserException() {
        GuildUserReq request = GuildUserReq.newBuilder().build();

        doThrow(new RuntimeException("error")).when(coreClient).addUser(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        guildService.deleteUser(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    private static class TestObserver<T> implements StreamObserver<T> {
        T value;
        boolean completed = false;
        boolean error = false;

        @Override
        public void onNext(T value) { this.value = value; }

        @Override
        public void onError(Throwable t) { this.error = true; }

        @Override
        public void onCompleted() { this.completed = true; }
    }
}
