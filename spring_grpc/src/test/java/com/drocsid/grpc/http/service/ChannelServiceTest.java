package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.channel.*;
import com.drocsid.grpc.http.controller.ChannelController;
import com.drocsid.grpc.http.dto.ChannelDto;
import com.drocsid.grpc.http.dto.MessageDto;
import com.drocsid.grpc.http.dto.MessageListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.Channel;
import com.drocsid.grpc.proto.Message;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChannelServiceTest {

    @Mock
    private CoreClient coreClient;

    @InjectMocks
    private ChannelService channelService;

    private final String userId = "1";
    private final String channelId = "10";

    @Test
    void testGetChannel() {
        when(coreClient.getChannel(any(CoreGetChannelRequest.class)))
                .thenReturn(Channel.newBuilder().build());

        ChannelDto result = channelService.getChannel(userId, channelId);

        verify(coreClient).getChannel(any(CoreGetChannelRequest.class));
        assertNotNull(result);
    }

    @Test
    void testUpdateChannel() {
        when(coreClient.updateChannel(any(CoreUpdateChannelRequest.class)))
                .thenReturn(Channel.newBuilder().build());

        ChannelController.ChannelBody body =
                new ChannelController.ChannelBody();
        body.setName("name");

        ChannelDto result =
                channelService.updateChannel(userId, channelId, body);

        verify(coreClient).updateChannel(any(CoreUpdateChannelRequest.class));
        assertNotNull(result);
    }


    @Test
    void testDeleteChannel() {
        doNothing().when(coreClient)
                .deleteChannel(any(CoreDeleteChannelRequest.class));

        ResponseMessageDto result =
                channelService.deleteChannel(userId, channelId);

        verify(coreClient).deleteChannel(any(CoreDeleteChannelRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetMessages() {
        when(coreClient.getMessages(any(CoreGetMessagesRequest.class)))
                .thenReturn(List.of(Message.newBuilder().build()));

        MessageListDto result =
                channelService.getMessages(userId, channelId, 0, 10);

        verify(coreClient).getMessages(any(CoreGetMessagesRequest.class));
        assertNotNull(result);
    }

    @Test
    void testCreateMessage() {
        when(coreClient.createMessage(any(CoreCreateMessageRequest.class)))
                .thenReturn(Message.newBuilder().build());

        MessageDto result =
                channelService.createMessage(userId, channelId, "hello");

        verify(coreClient).createMessage(any(CoreCreateMessageRequest.class));
        assertNotNull(result);
    }

    @Test
    void testDeleteMessage() {
        doNothing().when(coreClient)
                .deleteMessage(any(CoreDeleteMessageRequest.class));

        ResponseMessageDto result =
                channelService.deleteMessage(userId, channelId, "100");

        verify(coreClient).deleteMessage(any(CoreDeleteMessageRequest.class));
        assertNotNull(result);
    }
}
