package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.GuildEditUserRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreEditUserPermissionInGuildRequest {
    private BigInteger userId;
    private BigInteger id;
    private BigInteger guildUserId;
    private int role;

    public CoreEditUserPermissionInGuildRequest(GuildEditUserRequest request) {
        userId = new BigInteger(request.getUserId());
        id = new BigInteger(request.getId());
        guildUserId = new BigInteger(request.getGuildUserId());
        role = request.getRole();
    }
}
