package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.ChannelInfoReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreGetChannelRequest {
    private BigInteger userId;
    private BigInteger channelId;

    public CoreGetChannelRequest(String userIdString, ChannelInfoReq request) {
        this.userId = new BigInteger(userIdString);
        this.channelId = new BigInteger(request.getChannelId());
    }
}
