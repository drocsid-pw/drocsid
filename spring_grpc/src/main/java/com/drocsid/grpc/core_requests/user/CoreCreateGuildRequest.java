package com.drocsid.grpc.core_requests.user;

import com.drocsid.grpc.proto.CreateGuildRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CoreCreateGuildRequest {
    private BigInteger userId;
    private String name;
    private String icon;

    public CoreCreateGuildRequest(CreateGuildRequest request) {
        userId = new BigInteger(request.getUserId());
        name = request.getName();
        icon = request.getIcon();
    }
}
