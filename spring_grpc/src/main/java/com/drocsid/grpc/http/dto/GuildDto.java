package com.drocsid.grpc.http.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuildDto {
    private String guildId;
    private String name;
    private String icon;
    private String ownerId;
    private List<RoleDto> roles;
}
