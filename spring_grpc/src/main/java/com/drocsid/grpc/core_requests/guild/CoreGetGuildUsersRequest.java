package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.GuildInfoReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreGetGuildUsersRequest {
    private BigInteger userId;
    private BigInteger guildId;

    public CoreGetGuildUsersRequest(String userIdString, GuildInfoReq request) {
        this.userId = new BigInteger(userIdString);
        this.guildId = new BigInteger(request.getGuildId());
    }
}
