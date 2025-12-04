package com.drocsid.grpc.core_requests;

import com.drocsid.grpc.proto.CreateMessageRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;
import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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
