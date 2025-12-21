package com.drocsid.grpc.http.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChannelDto {
    private String channelId;
    private String name;
    private String guildId;
    private RoleListDto overrides;
}
