package com.drocsid.grpc.service;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChannelServiceTest {

    private CoreClient coreClient;
    private ChannelService channelService;

    @BeforeEach
    void setUp() {
        coreClient = mock(CoreClient.class);
        JwtAuthService jwtAuthService = mock(JwtAuthService.class);
        channelService = new ChannelService(coreClient, jwtAuthService);
    }

    @Test
    void testGetChannel() {
        TestObserver<Channel> observer = new TestObserver<>();

        ChannelInfoReq request = ChannelInfoReq.newBuilder()
                .setToken("token")
                .setChannelId("1")
                .build();

        channelService.getChannel(request, observer);

        verify(coreClient).getChannel(new CoreGetChannelRequest("1", request));
        assertTrue(observer.completed);
        assertNotNull(observer.value);
        assertInstanceOf(Channel.class, observer.value);
    }

    @Test
    void testGetChannelInfoException() {
        when(coreClient.getChannel(any())).thenThrow(new RuntimeException("error"));

        TestObserver<Channel> observer = new TestObserver<>();

        ChannelInfoReq request = ChannelInfoReq.newBuilder()
                .setToken("token")
                .setChannelId("1")
                .build();

        channelService.getChannel(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }
    @Test
    void testUpdateChannel() {
        UpdateChannelRequest request = UpdateChannelRequest.newBuilder().build();

        TestObserver<Channel> observer = new TestObserver<>();

        channelService.updateChannel(request, observer);

        verify(coreClient).updateChannel(new CoreUpdateChannelRequest("1", request));
        assertTrue(observer.completed);
        assertNotNull(observer.value);
        assertInstanceOf(Channel.class, observer.value);
    }

    @Test
    void testUpdateChannelException() {
        UpdateChannelRequest request = UpdateChannelRequest.newBuilder().build();

        doThrow(new RuntimeException("error")).when(coreClient).updateChannel(any());

        TestObserver<Channel> observer = new TestObserver<>();

        channelService.updateChannel(request, observer);

        assertTrue(observer.completed);
        assertNotNull(observer.value);
        assertInstanceOf(Channel.class, observer.value);
    }

    @Test
    void testDeleteChannel() {
        ChannelInfoReq request = ChannelInfoReq.newBuilder().build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        channelService.deleteChannel(request, observer);

        verify(coreClient).deleteChannel(new CoreDeleteChannelRequest("1", request));
        assertTrue(observer.completed);
        assertEquals("Channel deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteChannelException() {
        doThrow(new RuntimeException("error")).when(coreClient).deleteChannel(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        ChannelInfoReq request = ChannelInfoReq.newBuilder().build();

        channelService.deleteChannel(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetMessages() {
        TestObserver<MessageList> observer = new TestObserver<>();

        MessageBucketReq request = MessageBucketReq.newBuilder().build();
        channelService.getMessages(request, observer);

        verify(coreClient).getMessages(new CoreGetMessagesRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(MessageList.class, observer.value);
    }

    @Test
    void testGetAllMessagesException() {
        doThrow(new RuntimeException("error")).when(coreClient).getMessages(any());

        TestObserver<MessageList> observer = new TestObserver<>();

        MessageBucketReq request = MessageBucketReq.newBuilder().build();
        channelService.getMessages(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testCreateMessage() {
        CreateMessageReq request = CreateMessageReq.newBuilder().build();

        TestObserver<Message> observer = new TestObserver<>();

        channelService.createMessage(request, observer);

        verify(coreClient).createMessage(new CoreCreateMessageRequest("1", request));
        assertTrue(observer.completed);
        assertInstanceOf(Message.class, observer.value);
    }

    @Test
    void testCreateMessageException() {
        CreateMessageReq request = CreateMessageReq.newBuilder().build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).createMessage(any());

        TestObserver<Message> observer = new TestObserver<>();

        channelService.createMessage(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteMessage() {
        MessageReq request = MessageReq.newBuilder().build();

        ChannelServiceTest.TestObserver<ResponseMessage> observer = new ChannelServiceTest.TestObserver<>();

        channelService.deleteMessage(request, observer);

        verify(coreClient).deleteMessage(new CoreDeleteMessageRequest("1", request));

        assertTrue(observer.completed);
        assertEquals("Message deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteMessageException() {
        doThrow(new RuntimeException("error"))
                .when(coreClient).deleteMessage(any());

        MessageReq request = MessageReq.newBuilder().build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        channelService.deleteMessage(request, observer);

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
