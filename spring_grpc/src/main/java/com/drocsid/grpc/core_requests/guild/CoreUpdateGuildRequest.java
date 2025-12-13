package com.drocsid.grpc.core_requests.guild;

import com.drocsid.grpc.proto.UpdateGuildRequest;
import lombok.*;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CoreUpdateGuildRequest {
    private BigInteger userId;
    private BigInteger id;
    private String name;
    private String icon;

    public CoreUpdateGuildRequest(UpdateGuildRequest request) {
        userId = new BigInteger(request.getUserId());
        id = new BigInteger(request.getId());
        name = request.getName();
        icon = request.getIcon();
    }
}
