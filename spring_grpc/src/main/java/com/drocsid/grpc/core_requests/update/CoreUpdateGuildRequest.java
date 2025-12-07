package com.drocsid.grpc.core_requests.update;

import com.drocsid.grpc.proto.UpdateGuildRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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
