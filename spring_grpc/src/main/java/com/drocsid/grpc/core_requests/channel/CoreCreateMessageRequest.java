package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.CreateMessageRequest;
import lombok.*;

import java.math.BigInteger;
import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreCreateMessageRequest {
    private BigInteger userId;
    private BigInteger authorId;
    private String authorName;
    private Instant timestamp;
    private BigInteger channelId;

    public CoreCreateMessageRequest(CreateMessageRequest request) {
        userId = new BigInteger(request.getUserId());
        authorId = new BigInteger(request.getAuthorId());
        authorName = request.getAuthorName();
        timestamp = Instant.now();
        channelId = new BigInteger(request.getChannelId());
    }
}
