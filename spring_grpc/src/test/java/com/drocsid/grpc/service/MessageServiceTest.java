package com.drocsid.grpc.service;

import com.drocsid.grpc.core_requests.create.CoreCreateMessageRequest;
import com.drocsid.grpc.core_requests.update.CoreUpdateMessageRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MessageServiceTest {

    private CoreClient coreClient;
    private MessageService messageService;

    @BeforeEach
    void setUp() {
        coreClient = mock(CoreClient.class);
        messageService = new MessageService(coreClient);
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

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        messageService.createMessage(request, observer);

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

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        messageService.createMessage(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetMessage() {
        Message expected = Message.newBuilder()
                .setId("5")
                .setAuthorId("2")
                .setAuthorName("Alex")
                .setTimestamp("1111")
                .setContent("Hi")
                .setChannelId("10")
                .build();

        when(coreClient.getMessage(new BigInteger("1"), new BigInteger("5")))
                .thenReturn(expected);

        TestObserver<Message> observer = new TestObserver<>();

        MessageId id = MessageId.newBuilder()
                .setUserId("1")
                .setId("5")
                .build();

        messageService.getMessage(id, observer);

        verify(coreClient).getMessage(new BigInteger("1"), new BigInteger("5"));

        assertTrue(observer.completed);
        assertEquals(expected, observer.value);
    }

    @Test
    void testGetMessageException() {
        when(coreClient.getMessage(new BigInteger("1"), new BigInteger("5")))
                .thenThrow(new RuntimeException("error"));

        TestObserver<Message> observer = new TestObserver<>();

        MessageId id = MessageId.newBuilder()
                .setUserId("1")
                .setId("5")
                .build();

        messageService.getMessage(id, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testUpdateMessage() {
        UpdateMessageRequest request = UpdateMessageRequest.newBuilder()
                .setUserId("1")
                .setId("5")
                .setAuthorName("New Name")
                .setContent("New Content")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        messageService.updateMessage(request, observer);

        verify(coreClient).updateMessage(any(CoreUpdateMessageRequest.class));

        assertTrue(observer.completed);
        assertEquals("Message updated successfully.", observer.value.getText());
    }

    @Test
    void testUpdateMessageException() {
        UpdateMessageRequest request = UpdateMessageRequest.newBuilder()
                .setUserId("1")
                .setId("5")
                .setAuthorName("New Name")
                .setContent("Test")
                .build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).updateMessage(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        messageService.updateMessage(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteMessage() {
        MessageId id = MessageId.newBuilder()
                .setUserId("1")
                .setId("5")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        messageService.deleteMessage(id, observer);

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

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        messageService.deleteMessage(id, observer);

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
