package com.drocsid.grpc.service;

import com.drocsid.grpc.core_requests.guild.CoreCreateChannelRequest;
import com.drocsid.grpc.core_requests.guild.CoreUpdateGuildRequest;
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

    @BeforeEach
    void setUp() {
        coreClient = mock(CoreClient.class);
        guildService = new GuildService(coreClient);
    }

    @Test
    void testGetGuildInfo() {
        GuildInfo expected = GuildInfo.newBuilder()
                .setId("5")
                .setName("Guild1")
                .setOwnerId("1")
                .setIcon("icon.png")
                .build();

        when(coreClient.getGuildInfo(new BigInteger("1"), new BigInteger("5")))
                .thenReturn(expected);

        TestObserver<GuildInfo> observer = new TestObserver<>();
        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();

        guildService.getGuildInfo(id, observer);

        verify(coreClient).getGuildInfo(new BigInteger("1"), new BigInteger("5"));
        assertTrue(observer.completed);
        assertEquals(expected, observer.value);
    }

    @Test
    void testGetGuildException() {
        when(coreClient.getGuildInfo(new BigInteger("1"), new BigInteger("5")))
                .thenThrow(new RuntimeException("error"));

        TestObserver<GuildInfo> observer = new TestObserver<>();
        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();

        guildService.getGuildInfo(id, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testUpdateGuild() {
        UpdateGuildRequest request = UpdateGuildRequest.newBuilder()
                .setUserId("1")
                .setId("5")
                .setName("Updated Guild")
                .setIcon("new_icon.png")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.updateGuild(request, observer);

        verify(coreClient).updateGuild(any(CoreUpdateGuildRequest.class));
        assertTrue(observer.completed);
        assertEquals("Guild updated successfully.", observer.value.getText());
    }

    @Test
    void testUpdateGuildException() {
        UpdateGuildRequest request = UpdateGuildRequest.newBuilder()
                .setUserId("1")
                .setId("5")
                .setName("Updated Guild")
                .setIcon("new_icon.png")
                .build();


        doThrow(new RuntimeException("error")).when(coreClient).updateGuild(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.updateGuild(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testChangeGuildOwner() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("3")
                .setGuildUserId("3")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.changeGuildOwner(guildUserInfo, observer);

        verify(coreClient).changeGuildOwner(any());
        assertTrue(observer.completed);
        assertEquals("Guild owner changed successfully.", observer.value.getText());
    }

    @Test
    void testChangeGuildOwnerException() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("3")
                .setGuildUserId("3")
                .build();

        doThrow(new RuntimeException("error")).when(coreClient).changeGuildOwner(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.changeGuildOwner(guildUserInfo, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteGuild() {
        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();
        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.deleteGuild(id, observer);

        verify(coreClient).deleteGuild(new BigInteger("1"), new BigInteger("5"));
        assertTrue(observer.completed);
        assertEquals("Guild deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteGuildException() {
        doThrow(new RuntimeException("error")).when(coreClient)
                .deleteGuild(new BigInteger("1"), new BigInteger("5"));

        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();
        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.deleteGuild(id, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetAllGuilds() {
        Guild guild1 = Guild.newBuilder().setId("1").setName("Guild1").build();
        Guild guild2 = Guild.newBuilder().setId("2").setName("Guild2").build();

        when(coreClient.getAllGuilds(new BigInteger("1"))).thenReturn(List.of(guild1, guild2));

        TestObserver<GuildList> observer = new TestObserver<>();
        UserIdForGuild userId = UserIdForGuild.newBuilder().setId("1").build();

        guildService.getAllGuilds(userId, observer);

        verify(coreClient).getAllGuilds(new BigInteger("1"));
        assertTrue(observer.completed);
        assertEquals(2, observer.value.getGuildsCount());
        assertEquals(guild1, observer.value.getGuilds(0));
        assertEquals(guild2, observer.value.getGuilds(1));
    }

    @Test
    void testGetAllGuildsException() {
        doThrow(new RuntimeException("error")).when(coreClient).getAllGuilds(new BigInteger("1"));

        TestObserver<GuildList> observer = new TestObserver<>();
        UserIdForGuild userId = UserIdForGuild.newBuilder().setId("1").build();

        guildService.getAllGuilds(userId, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testCreateChannel() {
        CreateChannelRequest request = CreateChannelRequest.newBuilder()
                .setUserId("1")
                .setName("General")
                .setGuildId("100")
                .build();

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.createChannel(request, observer);

        verify(coreClient).createChannel(any(CoreCreateChannelRequest.class));
        assertTrue(observer.completed);
        assertEquals("Channel created successfully.", observer.value.getText());
    }

    @Test
    void testCreateChannelException() {
        CreateChannelRequest request = CreateChannelRequest.newBuilder()
                .setUserId("1")
                .setName("General")
                .setGuildId("100")
                .build();

        doThrow(new RuntimeException("error")).when(coreClient).createChannel(any());

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.createChannel(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteChannel() {
        DeleteChannelRequest request = DeleteChannelRequest.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildId("3")
                .build();

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.deleteChannel(request, observer);

        verify(coreClient).deleteChannel(any(), any());
        assertTrue(observer.completed);
        assertEquals("Channel deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteChannelException() {
        doThrow(new RuntimeException("error")).when(coreClient).deleteChannel(any(), any());

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        DeleteChannelRequest request = DeleteChannelRequest.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildId("3")
                .build();

        guildService.deleteChannel(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetAllChannels() {
        Channel ch1 = Channel.newBuilder().setId("1").setName("Chan1").build();
        Channel ch2 = Channel.newBuilder().setId("2").setName("Chan2").build();

        when(coreClient.getAllChannels(new BigInteger("1"), new BigInteger("5")))
                .thenReturn(List.of(ch1, ch2));

        TestObserver<ChannelList> observer = new TestObserver<>();
        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();

        guildService.getAllChannels(id, observer);

        verify(coreClient).getAllChannels(new BigInteger("1"), new BigInteger("5"));
        assertTrue(observer.completed);
        assertEquals(2, observer.value.getChannelsCount());
        assertEquals(ch1, observer.value.getChannels(0));
        assertEquals(ch2, observer.value.getChannels(1));
    }

    @Test
    void testGetAllChannelsException() {
        doThrow(new RuntimeException("error")).when(coreClient).getAllChannels(new BigInteger("1"), new BigInteger("5"));

        TestObserver<ChannelList> observer = new TestObserver<>();
        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();

        guildService.getAllChannels(id, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testAddUser() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .build();

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.addUser(guildUserInfo, observer);

        verify(coreClient).addUser(any());
        assertTrue(observer.completed);
        assertEquals("User added successfully.", observer.value.getText());
    }

    @Test
    void testAddUserException() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .build();


        doThrow(new RuntimeException("error")).when(coreClient).addUser(any());

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.addUser(guildUserInfo, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testSendInvitationToUser() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .build();

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.sendInvitationToUser(guildUserInfo, observer);

        verify(coreClient).sendInvitationToUser(any());
        assertTrue(observer.completed);
        assertEquals("Invitation sent successfully.", observer.value.getText());
    }

    @Test
    void testSendInvitationToUserException() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .build();

        doThrow(new RuntimeException("error")).when(coreClient).sendInvitationToUser(any());

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.sendInvitationToUser(guildUserInfo, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testRemoveUser() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .build();

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.removeUser(guildUserInfo, observer);

        verify(coreClient).removeUser(any());
        assertTrue(observer.completed);
        assertEquals("User removed successfully.", observer.value.getText());
    }

    @Test
    void testRemoveUserException() {
        GuildUserInfo guildUserInfo = GuildUserInfo.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .build();

        doThrow(new RuntimeException("error")).when(coreClient).removeUser(any());

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.removeUser(guildUserInfo, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testEditUserPermissions() {
        GuildEditUserRequest request = GuildEditUserRequest.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .setRole(15)
                .build();

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.editUserPermission(request, observer);

        verify(coreClient).editUserPermissions(any());
        assertTrue(observer.completed);
        assertEquals("User's permissions changed successfully.", observer.value.getText());
    }

    @Test
    void testEditUserPermissionsException() {
        GuildEditUserRequest request = GuildEditUserRequest.newBuilder()
                .setUserId("1")
                .setId("2")
                .setGuildUserId("3")
                .setRole(15)
                .build();

        doThrow(new RuntimeException("error")).when(coreClient).editUserPermissions(any());

        GuildServiceTest.TestObserver<ResponseMessage> observer = new GuildServiceTest.TestObserver<>();

        guildService.editUserPermission(request, observer);

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
