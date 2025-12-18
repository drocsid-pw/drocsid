package com.drocsid.grpc.core_requests.guild;

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

    public CoreCreateGuildRequest(String userIdString, CreateGuildRequest request) {
        userId = new BigInteger(userIdString);
        name = request.getName();
        icon = request.getIcon();
    }
}
