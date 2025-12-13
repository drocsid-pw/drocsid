package com.drocsid.grpc.core_requests.user;

import com.drocsid.grpc.proto.CreateGuildRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
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
