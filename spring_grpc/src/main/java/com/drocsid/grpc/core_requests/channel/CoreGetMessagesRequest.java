package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.MessageBucketReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreGetMessagesRequest {
    private BigInteger userId;
    private BigInteger channelId;
    private int offset;
    private int count;

    public CoreGetMessagesRequest(String userId, MessageBucketReq request) {
        this.userId = new BigInteger(userId);
        this.channelId = new BigInteger(request.getReq().getChannelId());
        this.offset = request.getOffset();
        this.count = request.getCount();
    }
}
