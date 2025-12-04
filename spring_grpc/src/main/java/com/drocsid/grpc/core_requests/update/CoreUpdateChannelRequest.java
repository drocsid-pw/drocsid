package com.drocsid.grpc.core_requests.update;

import com.drocsid.grpc.proto.Message;
import com.drocsid.grpc.proto.UpdateChannelRequest;
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
public class CoreUpdateChannelRequest {
    private BigInteger userId;
    private BigInteger id;
    private String name;
    private List<Message> messages;
    private BigInteger guildId;

    public CoreUpdateChannelRequest(UpdateChannelRequest request) {
        userId = new BigInteger(request.getUserId());
        id = new BigInteger(request.getId());
        name = request.getName();
        messages = new ArrayList<>(request.getMessagesList());
        guildId = new BigInteger(request.getGuildId());
    }
}
