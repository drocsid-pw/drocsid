package com.drocsid.grpc.core_requests.user;

import com.drocsid.grpc.proto.UpdateUserRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateUserRequest {
    private BigInteger userId;
    private String name;
    private String avatarHash;

    public CoreUpdateUserRequest(String userIdString, UpdateUserRequest request) {
        userId = new BigInteger(userIdString);
        name = request.getName();
        avatarHash = request.getAvatarHash();
    }
}
