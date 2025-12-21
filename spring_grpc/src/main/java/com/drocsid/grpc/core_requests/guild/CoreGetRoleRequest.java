package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.RoleReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreGetRoleRequest {
    private BigInteger userId;
    private BigInteger guildId;
    private BigInteger roleId;

    public CoreGetRoleRequest(String userIdString, RoleReq request) {
        this.userId = new BigInteger(userIdString);
        this.guildId = new BigInteger(request.getGuildId());
        this.roleId = new BigInteger(request.getGuildRoleId());
    }
}
