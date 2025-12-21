package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.Role;
import com.drocsid.grpc.proto.UpdateUserReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateGuildUserRequest {
    private BigInteger userId;
    private BigInteger guildId;
    private String nick;
    private List<Role> roles;

    public CoreUpdateGuildUserRequest(String userIdString, UpdateUserReq request) {
        this.userId = new BigInteger(userIdString);
        this.guildId = new BigInteger(request.getGuildId());
        this.nick = request.getUser().getNick();
        this.roles = request.getUser().getRoles().getRolesList();
    }
}
