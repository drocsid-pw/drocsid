package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.CreateMessageReq;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreCreateMessageRequest {
    private BigInteger userId;
    private BigInteger channelId;
    private String content;

    public CoreCreateMessageRequest(String userIdString, CreateMessageReq request) {
        userId = new BigInteger(userIdString);
        channelId = new BigInteger(request.getReq().getChannelId());
        content = request.getMessage().getContent();
    }
}
