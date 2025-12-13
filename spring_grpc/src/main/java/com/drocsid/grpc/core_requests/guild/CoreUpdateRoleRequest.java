package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.UpdateRoleReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateRoleRequest {
    private BigInteger userId;
    private BigInteger guildId;
    private BigInteger guildRoleId;
    private String roleName;
    private String permissions;

    public CoreUpdateRoleRequest(String userIdString, UpdateRoleReq request) {
        this.userId = new BigInteger(userIdString);
        this.guildId = new BigInteger(request.getGuildId());
        this.guildRoleId = new BigInteger(request.getRole().getGuildRoleId());
        this.roleName = request.getRole().getRoleName();
        this.permissions = request.getRole().getPermissions();
    }
}
