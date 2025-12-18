package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.UpdateGuildRequest;
import com.drocsid.grpc.proto.Role;
import lombok.*;

import java.math.BigInteger;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateGuildRequest {
    private BigInteger userId;
    private BigInteger guildId;
    private String name;
    private String icon;
    private BigInteger ownerId;
    private List<Role> roles;

    public CoreUpdateGuildRequest(String userIdString, UpdateGuildRequest request) {
        userId = new BigInteger(userIdString);
        guildId = new BigInteger(request.getGuild().getGuildId());
        name = request.getGuild().getName();
        icon = request.getGuild().getIcon();
        ownerId = new BigInteger(request.getGuild().getOwnerId());
        roles = request.getGuild().getRolesList();
    }
}
