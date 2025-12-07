package com.drocsid.grpc.service;

import com.drocsid.grpc.core_requests.create.CoreCreateGuildRequest;
import com.drocsid.grpc.core_requests.update.CoreUpdateGuildRequest;
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
    void testCreateGuild() {
        CreateGuildRequest request = CreateGuildRequest.newBuilder()
                .setUserId("1")
                .setName("Guild1")
                .setIcon("icon.png")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        guildService.createGuild(request, observer);

        verify(coreClient).createGuild(any(CoreCreateGuildRequest.class));
        assertTrue(observer.completed);
        assertEquals("Guild created successfully.", observer.value.getText());
    }

    @Test
    void testCreateGuildException() {
        CreateGuildRequest request = CreateGuildRequest.newBuilder()
                .setUserId("1")
                .setName("Guild1")
                .setIcon("icon.png")
                .build();

        doThrow(new RuntimeException("error")).when(coreClient).createGuild(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();
        guildService.createGuild(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetGuild() {
        Channel exampleChannel1 = Channel.newBuilder()
                .setId("10")
                .setName("General")
                .build();
        Channel exampleChannel2 = Channel.newBuilder()
                .setId("10")
                .setName("General")
                .build();

        Guild expected = Guild.newBuilder()
                .setId("5")
                .setName("Guild1")
                .setOwnerId("1")
                .setIcon("icon.png")
                .addChannels(exampleChannel1)
                .addChannels(exampleChannel2)
                .build();

        when(coreClient.getGuild(new BigInteger("1"), new BigInteger("5")))
                .thenReturn(expected);

        TestObserver<Guild> observer = new TestObserver<>();
        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();

        guildService.getGuild(id, observer);

        verify(coreClient).getGuild(new BigInteger("1"), new BigInteger("5"));
        assertTrue(observer.completed);
        assertEquals(expected, observer.value);
    }

    @Test
    void testGetGuildException() {
        when(coreClient.getGuild(new BigInteger("1"), new BigInteger("5")))
                .thenThrow(new RuntimeException("error"));

        TestObserver<Guild> observer = new TestObserver<>();
        GuildId id = GuildId.newBuilder().setUserId("1").setId("5").build();

        guildService.getGuild(id, observer);

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
        UserId userId = UserId.newBuilder().setId("1").build();

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
        UserId userId = UserId.newBuilder().setId("1").build();

        guildService.getAllGuilds(userId, observer);

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
