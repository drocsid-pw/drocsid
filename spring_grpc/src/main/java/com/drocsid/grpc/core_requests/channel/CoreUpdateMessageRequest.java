package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.UpdateMessageRequest;
import lombok.*;

import java.math.BigInteger;
import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateMessageRequest {
    private BigInteger id;
    private BigInteger userId;
    private String authorName;
    private String content;
    private Instant timestamp;

    public CoreUpdateMessageRequest(UpdateMessageRequest request) {
        id = new BigInteger(request.getId());
        userId = new BigInteger(request.getUserId());
        authorName = request.getAuthorName();
        content = request.getContent();
        timestamp = Instant.now();
    }
}
