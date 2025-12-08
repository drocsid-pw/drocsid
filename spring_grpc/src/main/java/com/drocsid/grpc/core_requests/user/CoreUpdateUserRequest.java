package com.drocsid.grpc.core_requests.user;

import com.drocsid.grpc.proto.UpdateUserRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateUserRequest {
    private BigInteger id;
    private String name;
    private String avatarLetter;
    private String avatarHash;

    public CoreUpdateUserRequest(UpdateUserRequest request) {
        id = new BigInteger(request.getId());
        name = request.getName();
        avatarLetter = request.getAvatarLetter();
        avatarHash = request.getAvatarHash();
    }
}
