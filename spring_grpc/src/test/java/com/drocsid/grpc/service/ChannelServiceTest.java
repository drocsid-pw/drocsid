package com.drocsid.grpc.service;

import com.drocsid.grpc.core_requests.channel.CoreCreateMessageRequest;
import com.drocsid.grpc.core_requests.channel.CoreUpdateChannelRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChannelServiceTest {

    private CoreClient coreClient;
    private ChannelService channelService;

    @BeforeEach
    void setUp() {
        coreClient = mock(CoreClient.class);
        channelService = new ChannelService(coreClient);
    }

    @Test
    void testGetChannelInfo() {
        ChannelInfo expected = ChannelInfo.newBuilder()
                .setId("5")
                .setName("General")
                .setGuildId("100")
                .build();

        when(coreClient.getChannelInfo(new BigInteger("1"), new BigInteger("5")))
                .thenReturn(expected);

        TestObserver<ChannelInfo> observer = new TestObserver<>();

        ChannelId id = ChannelId.newBuilder()
                .setUserId("1")
                .setId("5")
                .build();

        channelService.getChannelInfo(id, observer);

        verify(coreClient).getChannelInfo(new BigInteger("1"), new BigInteger("5"));
        assertTrue(observer.completed);
        assertEquals(expected, observer.value);
    }

    @Test
    void testGetChannelInfoException() {
        when(coreClient.getChannelInfo(new BigInteger("1"), new BigInteger("5")))
                .thenThrow(new RuntimeException("error"));

        TestObserver<ChannelInfo> observer = new TestObserver<>();

        ChannelId id = ChannelId.newBuilder()
                .setUserId("1")
                .setId("5")
                .build();

        channelService.getChannelInfo(id, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }
    @Test
    void testUpdateChannel() {
        UpdateChannelRequest request = UpdateChannelRequest.newBuilder()
                .setUserId("1")
                .setId("5")
                .setName("Updated Name")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        channelService.updateChannel(request, observer);

        verify(coreClient).updateChannel(any(CoreUpdateChannelRequest.class));
        assertTrue(observer.completed);
        assertEquals("Channel updated successfully.", observer.value.getText());
    }

    @Test
    void testUpdateChannelException() {
        UpdateChannelRequest request = UpdateChannelRequest.newBuilder()
                .setUserId("1")
                .setId("5")
                .setName("Updated Name")
                .build();

        doThrow(new RuntimeException("error")).when(coreClient).updateChannel(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        channelService.updateChannel(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetLastMessage() {
        Message expected = Message.newBuilder()
                .setId("10")
                .setContent("Last message")
                .build();

        when(coreClient.getLastMessage(new BigInteger("1"), new BigInteger("5"))).thenReturn(expected);

        TestObserver<Message> observer = new TestObserver<>();

        ChannelId id = ChannelId.newBuilder().setUserId("1").setId("5").build();
        channelService.getLastMessage(id, observer);

        verify(coreClient).getLastMessage(new BigInteger("1"), new BigInteger("5"));
        assertTrue(observer.completed);
        assertEquals(expected, observer.value);
    }

    @Test
    void testGetLastMessageException() {
        doThrow(new RuntimeException("error")).when(coreClient).getLastMessage(new BigInteger("1"), new BigInteger("5"));

        TestObserver<Message> observer = new TestObserver<>();

        ChannelId id = ChannelId.newBuilder().setUserId("1").setId("5").build();
        channelService.getLastMessage(id, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }


    @Test
    void testGetAllMessages() {
        Message msg1 = Message.newBuilder().setId("1").setContent("A").build();
        Message msg2 = Message.newBuilder().setId("2").setContent("B").build();

        when(coreClient.getAllMessages(new BigInteger("1"), new BigInteger("5"))).thenReturn(List.of(msg1, msg2));

        TestObserver<MessageList> observer = new TestObserver<>();

        ChannelId id = ChannelId.newBuilder().setUserId("1").setId("5").build();
        channelService.getAllMessages(id, observer);

        verify(coreClient).getAllMessages(new BigInteger("1"), new BigInteger("5"));
        assertTrue(observer.completed);
        assertEquals(2, observer.value.getMessagesCount());
        assertEquals(msg1, observer.value.getMessages(0));
        assertEquals(msg2, observer.value.getMessages(1));
    }

    @Test
    void testGetAllMessagesException() {
        doThrow(new RuntimeException("error")).when(coreClient).getAllMessages(new BigInteger("1"), new BigInteger("5"));

        TestObserver<MessageList> observer = new TestObserver<>();

        ChannelId id = ChannelId.newBuilder().setUserId("1").setId("5").build();
        channelService.getAllMessages(id, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testCreateMessage() {
        CreateMessageRequest request = CreateMessageRequest.newBuilder()
                .setUserId("1")
                .setAuthorId("2")
                .setAuthorName("Alex")
                .setContent("Hello")
                .setChannelId("10")
                .build();

        ChannelServiceTest.TestObserver<ResponseMessage> observer = new ChannelServiceTest.TestObserver<>();

        channelService.createMessage(request, observer);

        verify(coreClient).createMessage(any(CoreCreateMessageRequest.class));

        assertTrue(observer.completed);
        assertEquals("Message created successfully.", observer.value.getText());
    }

    @Test
    void testCreateMessageException() {
        CreateMessageRequest request = CreateMessageRequest.newBuilder()
                .setUserId("1")
                .setAuthorId("2")
                .setAuthorName("Alex")
                .setContent("Hello")
                .setChannelId("10")
                .build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).createMessage(any());

        ChannelServiceTest.TestObserver<ResponseMessage> observer = new ChannelServiceTest.TestObserver<>();

        channelService.createMessage(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteMessage() {
        MessageId id = MessageId.newBuilder()
                .setUserId("1")
                .setId("5")
                .build();

        ChannelServiceTest.TestObserver<ResponseMessage> observer = new ChannelServiceTest.TestObserver<>();

        channelService.deleteMessage(id, observer);

        verify(coreClient).deleteMessage(new BigInteger("1"), new BigInteger("5"));

        assertTrue(observer.completed);
        assertEquals("Message deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteMessageException() {
        doThrow(new RuntimeException("error"))
                .when(coreClient).deleteMessage(new BigInteger("1"), new BigInteger("5"));

        MessageId id = MessageId.newBuilder()
                .setUserId("1")
                .setId("5")
                .build();

        ChannelServiceTest.TestObserver<ResponseMessage> observer = new ChannelServiceTest.TestObserver<>();

        channelService.deleteMessage(id, observer);

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
