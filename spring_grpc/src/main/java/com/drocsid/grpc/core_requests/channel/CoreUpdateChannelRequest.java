package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.UpdateChannelRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateChannelRequest {
    private BigInteger userId;
    private BigInteger id;
    private String name;

    public CoreUpdateChannelRequest(UpdateChannelRequest request) {
        userId = new BigInteger(request.getUserId());
        id = new BigInteger(request.getId());
        name = request.getName();
    }
}
