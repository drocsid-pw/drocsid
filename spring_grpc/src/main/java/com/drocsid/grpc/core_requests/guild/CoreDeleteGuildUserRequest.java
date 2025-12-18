package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.GuildUserReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreDeleteGuildUserRequest {
    private BigInteger userId;
    private BigInteger guildId;
    private BigInteger guildUserId;

    public CoreDeleteGuildUserRequest(String userIdString, GuildUserReq request) {
        userId = new BigInteger(userIdString);
        guildId = new BigInteger(request.getGuildId());
        guildUserId = new BigInteger(request.getGuildUserId());
    }
}
