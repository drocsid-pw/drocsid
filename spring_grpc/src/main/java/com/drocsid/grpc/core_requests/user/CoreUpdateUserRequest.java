package com.drocsid.grpc.core_requests.user;

import com.drocsid.grpc.proto.UpdateUserRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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
