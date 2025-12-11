package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.Channel;
import com.drocsid.grpc.proto.UpdateChannelRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateChannelRequest {
    private BigInteger userId;
    private Channel channel;

    public CoreUpdateChannelRequest(String userIdString, UpdateChannelRequest request) {
        userId = new BigInteger(userIdString);
        channel = request.getChannel();
    }
}
