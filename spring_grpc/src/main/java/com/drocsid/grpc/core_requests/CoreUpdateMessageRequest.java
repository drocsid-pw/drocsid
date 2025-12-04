package com.drocsid.grpc.core_requests;

import com.drocsid.grpc.proto.UpdateMessageRequest;
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
public class CoreUpdateMessageRequest {
    private BigInteger id;
    private BigInteger userId;
    private String authorName;
    private Instant timestamp;

    public CoreUpdateMessageRequest(UpdateMessageRequest request) {
        id = new BigInteger(request.getId());
        userId = new BigInteger(request.getUserId());
        authorName = request.getAuthorName();
        timestamp = Instant.now();
    }
}
