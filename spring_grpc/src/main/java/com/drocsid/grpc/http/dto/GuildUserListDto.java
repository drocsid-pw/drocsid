package com.drocsid.grpc.http.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuildUserListDto {
    private List<GuildUserDto> guildUsers;
}
