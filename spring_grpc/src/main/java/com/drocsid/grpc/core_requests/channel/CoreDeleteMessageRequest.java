package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.MessageReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreDeleteMessageRequest {
    private BigInteger userId;
    private BigInteger channelId;
    private BigInteger messageId;

    public CoreDeleteMessageRequest(String userIdString, MessageReq request) {
        userId = new BigInteger(userIdString);
        channelId = new BigInteger(request.getReq().getChannelId());
        messageId = new BigInteger(request.getMessageReq().getMessageId());
    }
}
