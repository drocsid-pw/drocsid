package com.drocsid.grpc.core_requests.update;

import com.drocsid.grpc.proto.Channel;
import com.drocsid.grpc.proto.UpdateGuildRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CoreUpdateGuildRequest {
    private BigInteger userId;
    private BigInteger id;
    private String name;
    private String icon;
    private BigInteger ownerId;
    private List<Channel> channels;

    public CoreUpdateGuildRequest(UpdateGuildRequest request) {
        userId = new BigInteger(request.getUserId());
        id = new BigInteger(request.getId());
        name = request.getName();
        icon = request.getIcon();
        ownerId = new BigInteger(request.getOwnerId());
        channels = new ArrayList<>(request.getChannelsList());
    }
}
