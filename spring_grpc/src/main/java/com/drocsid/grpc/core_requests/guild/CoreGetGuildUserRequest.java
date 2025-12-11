package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.GuildUserReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreGetGuildUserRequest {
    private BigInteger userId;
    private BigInteger guildId;
    private BigInteger guild_user_id;

    public CoreGetGuildUserRequest(String userIdString, GuildUserReq request) {
        this.userId = new BigInteger(userIdString);
        this.guildId = new BigInteger(request.getGuildId());
        this.guild_user_id = new BigInteger(request.getGuildUserId());
    }
}
