package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.GuildUserInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreRemoveUserRequest {
    private BigInteger userId;
    private BigInteger id;
    private BigInteger guildUserId;

    public CoreRemoveUserRequest(GuildUserInfo guildUserInfo) {
        userId = new BigInteger(guildUserInfo.getUserId());
        id = new BigInteger(guildUserInfo.getId());
        guildUserId = new BigInteger(guildUserInfo.getGuildUserId());
    }
}
