package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.AddUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreAddUserRequest {
    private BigInteger userId;
    private BigInteger guildId;

    public CoreAddUserRequest(String userIdString, AddUser addUserObj) {
        userId = new BigInteger(userIdString);
        guildId = new BigInteger(addUserObj.getGuildId());
    }
}
