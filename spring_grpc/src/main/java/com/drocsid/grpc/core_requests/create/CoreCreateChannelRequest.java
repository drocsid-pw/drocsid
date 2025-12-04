package com.drocsid.grpc.core_requests.create;

import com.drocsid.grpc.proto.CreateChannelRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CoreCreateChannelRequest {
    private BigInteger userId;
    private String name;
    private BigInteger guildId;

    public CoreCreateChannelRequest(CreateChannelRequest request) {
        userId = new BigInteger(request.getUserId());
        name = request.getName();
        guildId = new BigInteger(request.getGuildId());
    }
}
