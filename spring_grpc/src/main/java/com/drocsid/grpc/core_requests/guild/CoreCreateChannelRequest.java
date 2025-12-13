package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.CreateChannelRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
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
