// package com.drocsid.grpc.service;

// import com.drocsid.grpc.auth.JwtAuthService;
// import com.drocsid.grpc.core_requests.channel.*;
// import com.drocsid.grpc.mock_classes.CoreClient;
// import com.drocsid.grpc.proto.*;
// import io.grpc.stub.StreamObserver;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// class ChannelServiceTest {

//     private CoreClient coreClient;
//     private ChannelService channelService;
//     private JwtAuthService jwtAuthService;

//     @BeforeEach
//     void setUp() {
//         coreClient = mock(CoreClient.class);
//         jwtAuthService = mock(JwtAuthService.class);

//         when(jwtAuthService.checkAuth(any())).thenReturn("1");
//         channelService = new ChannelService(coreClient, jwtAuthService);
//     }

//     @Test
//     void testGetChannel() {
//         Channel returnedChannel = Channel.newBuilder().build();
//         when(coreClient.getChannel(any(CoreGetChannelRequest.class)))
//                 .thenReturn(returnedChannel);
//         TestObserver<Channel> observer = new TestObserver<>();

//         ChannelInfoReq request = ChannelInfoReq.newBuilder()
//                 .setToken("token")
//                 .setChannelId("1")
//                 .build();

//         channelService.getChannel(request, observer);

//         verify(coreClient).getChannel(new CoreGetChannelRequest("1", request));
//         assertTrue(observer.completed);
//         assertNotNull(observer.value);
//         assertInstanceOf(Channel.class, observer.value);
//     }

//     @Test
//     void testGetChannelInfoException() {
//         when(coreClient.getChannel(any())).thenThrow(new RuntimeException("error"));

//         TestObserver<Channel> observer = new TestObserver<>();

//         ChannelInfoReq request = ChannelInfoReq.newBuilder()
//                 .setToken("token")
//                 .setChannelId("1")
//                 .build();

//         channelService.getChannel(request, observer);

//         assertTrue(observer.error);
//         assertFalse(observer.completed);
//     }
//     @Test
//     void testUpdateChannel() {
//         Channel returnedChannel = Channel.newBuilder().build();
//         when(coreClient.updateChannel(any(CoreUpdateChannelRequest.class)))
//                 .thenReturn(returnedChannel);
//         UpdateChannelRequest request = UpdateChannelRequest.newBuilder()
//                 .setToken("token")
//                 .build();

//         TestObserver<Channel> observer = new TestObserver<>();

//         channelService.updateChannel(request, observer);

//         verify(coreClient).updateChannel(any(CoreUpdateChannelRequest.class));
//         assertTrue(observer.completed);
//         assertNotNull(observer.value);
//         assertInstanceOf(Channel.class, observer.value);
//     }

//     @Test
//     void testUpdateChannelException() {
//         UpdateChannelRequest request = UpdateChannelRequest.newBuilder().setToken("token").build();

//         doThrow(new RuntimeException("error")).when(coreClient).updateChannel(any());

//         TestObserver<Channel> observer = new TestObserver<>();

//         channelService.updateChannel(request, observer);

//         assertTrue(observer.error);
//         assertFalse(observer.completed);
//     }

//     @Test
//     void testDeleteChannel() {
//         ChannelInfoReq request = ChannelInfoReq.newBuilder().setChannelId("1").build();

//         TestObserver<ResponseMessage> observer = new TestObserver<>();

//         channelService.deleteChannel(request, observer);

//         verify(coreClient).deleteChannel(new CoreDeleteChannelRequest("1", request));
//         assertTrue(observer.completed);
//         assertEquals("Channel deleted successfully.", observer.value.getText());
//     }

//     @Test
//     void testDeleteChannelException() {
//         doThrow(new RuntimeException("error")).when(coreClient).deleteChannel(any());

//         TestObserver<ResponseMessage> observer = new TestObserver<>();

//         ChannelInfoReq request = ChannelInfoReq.newBuilder().setChannelId("1").build();

//         channelService.deleteChannel(request, observer);

//         assertTrue(observer.error);
//         assertFalse(observer.completed);
//     }

//     @Test
//     void testGetMessages() {
//         TestObserver<MessageList> observer = new TestObserver<>();

//         MessageBucketReq request = MessageBucketReq
//                 .newBuilder()
//                 .setReq(ChannelInfoReq.newBuilder().setToken("token").setChannelId("1").build())
//                 .setOffset(1)
//                 .setCount(1)
//                 .build();
//         channelService.getMessages(request, observer);

//         verify(coreClient).getMessages(new CoreGetMessagesRequest("1", request));
//         assertTrue(observer.completed);
//         assertInstanceOf(MessageList.class, observer.value);
//     }

//     @Test
//     void testGetAllMessagesException() {
//         doThrow(new RuntimeException("error")).when(coreClient).getMessages(any());

//         TestObserver<MessageList> observer = new TestObserver<>();

//         MessageBucketReq request = MessageBucketReq
//                 .newBuilder()
//                 .setReq(ChannelInfoReq.newBuilder().setToken("token").setChannelId("1").build())
//                 .setOffset(1)
//                 .setCount(1)
//                 .build();
//         channelService.getMessages(request, observer);

//         assertTrue(observer.error);
//         assertFalse(observer.completed);
//     }

//     @Test
//     void testCreateMessage() {
//         CreateMessageReq request = CreateMessageReq
//                 .newBuilder()
//                 .setReq(ChannelInfoReq.newBuilder().setToken("token").setChannelId("1").build())
//                 .setMessage(GeneralCreateMessageRequest.newBuilder().setContent("content").build())
//                 .build();

//         Message returnedMessage = Message.newBuilder().build();
//         when(coreClient.createMessage(any(CoreCreateMessageRequest.class)))
//                 .thenReturn(returnedMessage);

//         TestObserver<Message> observer = new TestObserver<>();

//         channelService.createMessage(request, observer);

//         verify(coreClient).createMessage(any(CoreCreateMessageRequest.class));
//         assertTrue(observer.completed);
//         assertInstanceOf(Message.class, observer.value);
//     }

//     @Test
//     void testCreateMessageException() {
//         CreateMessageReq request = CreateMessageReq
//                 .newBuilder()
//                 .setReq(ChannelInfoReq.newBuilder().setToken("token").setChannelId("1").build())
//                 .setMessage(GeneralCreateMessageRequest.newBuilder().setContent("content").build())
//                 .build();

//         doThrow(new RuntimeException("error"))
//                 .when(coreClient).createMessage(any());

//         TestObserver<Message> observer = new TestObserver<>();

//         channelService.createMessage(request, observer);

//         assertTrue(observer.error);
//         assertFalse(observer.completed);
//     }

//     @Test
//     void testDeleteMessage() {
//         MessageReq request = MessageReq.newBuilder()
//                 .setReq(ChannelInfoReq
//                         .newBuilder()
//                         .setToken("token")
//                         .setChannelId("1")
//                         .build())
//                 .setMessageReq(GeneralMessageReq
//                         .newBuilder()
//                         .setMessageId("1")
//                         .build())
//                 .build();

//         ChannelServiceTest.TestObserver<ResponseMessage> observer = new ChannelServiceTest.TestObserver<>();

//         channelService.deleteMessage(request, observer);

//         verify(coreClient).deleteMessage(new CoreDeleteMessageRequest("1", request));

//         assertTrue(observer.completed);
//         assertEquals("Message deleted successfully.", observer.value.getText());
//     }

//     @Test
//     void testDeleteMessageException() {
//         doThrow(new RuntimeException("error"))
//                 .when(coreClient).deleteMessage(any());

//         MessageReq request = MessageReq.newBuilder()
//                 .setReq(ChannelInfoReq
//                         .newBuilder()
//                         .setToken("token")
//                         .setChannelId("1")
//                         .build())
//                 .setMessageReq(GeneralMessageReq
//                         .newBuilder()
//                         .setMessageId("1")
//                         .build())
//                 .build();

//         TestObserver<ResponseMessage> observer = new TestObserver<>();

//         channelService.deleteMessage(request, observer);

//         assertTrue(observer.error);
//         assertFalse(observer.completed);
//     }


//     private static class TestObserver<T> implements StreamObserver<T> {
//         T value;
//         boolean completed = false;
//         boolean error = false;

//         @Override
//         public void onNext(T value) { this.value = value; }

//         @Override
//         public void onError(Throwable t) { this.error = true; }

//         @Override
//         public void onCompleted() { this.completed = true; }
//     }
// }
