package com.drocsid.grpc.core_requests.channel;

import com.drocsid.grpc.proto.UpdateChannelRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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
