package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.guild.*;
import com.drocsid.grpc.http.controller.GuildController;
import com.drocsid.grpc.http.dto.*;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuildServiceTest {

    @Mock
    private CoreClient coreClient;

    @InjectMocks
    private GuildService guildService;

    private final String userId = "1";
    private final String guildId = "10";
    private final String roleId = "100";
    private final String guildUserId = "200";


    @Test
    void testCreateGuild() {
        when(coreClient.createGuild(any(CoreCreateGuildRequest.class)))
                .thenReturn(Guild.newBuilder().build());

        GuildDto result = guildService.createGuild(userId, "guild", null);

        verify(coreClient).createGuild(any(CoreCreateGuildRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetGuild() {
        when(coreClient.getGuild(any(CoreGetGuildRequest.class)))
                .thenReturn(Guild.newBuilder().build());

        GuildDto result = guildService.getGuild(userId, guildId);

        verify(coreClient).getGuild(any(CoreGetGuildRequest.class));
        assertNotNull(result);
    }

    @Test
    void testUpdateGuild() {
        when(coreClient.updateGuild(any(CoreUpdateGuildRequest.class)))
                .thenReturn(Guild.newBuilder().build());

        GuildController.GuildBody body = new GuildController.GuildBody();
        body.setName("guild");

        GuildDto result =
                guildService.updateGuild(userId, guildId, body);

        verify(coreClient).updateGuild(any(CoreUpdateGuildRequest.class));
        assertNotNull(result);
    }

    @Test
    void testDeleteGuild() {
        doNothing().when(coreClient)
                .deleteGuild(any(CoreDeleteGuildRequest.class));

        ResponseMessageDto result =
                guildService.deleteGuild(userId, guildId);

        verify(coreClient).deleteGuild(any(CoreDeleteGuildRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetAllChannels() {
        when(coreClient.getAllChannels(any(CoreGetAllChannelsRequest.class)))
                .thenReturn(List.of(Channel.newBuilder().build()));

        ChannelListDto result =
                guildService.getAllChannels(userId, guildId);

        verify(coreClient).getAllChannels(any(CoreGetAllChannelsRequest.class));
        assertNotNull(result);
    }

    @Test
    void testCreateChannel() {
        when(coreClient.createChannel(any(CoreCreateChannelRequest.class)))
                .thenReturn(Channel.newBuilder().build());

        ChannelDto result =
                guildService.createChannel(userId, guildId, "channel");

        verify(coreClient).createChannel(any(CoreCreateChannelRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetRoles() {
        when(coreClient.getRoles(any(CoreGetRolesRequest.class)))
                .thenReturn(List.of(Role.newBuilder().build()));

        RoleListDto result =
                guildService.getRoles(userId, guildId);

        verify(coreClient).getRoles(any(CoreGetRolesRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetRole() {
        when(coreClient.getRole(any(CoreGetRoleRequest.class)))
                .thenReturn(Role.newBuilder().build());

        RoleDto result =
                guildService.getRole(userId, guildId, roleId);

        verify(coreClient).getRole(any(CoreGetRoleRequest.class));
        assertNotNull(result);
    }

    @Test
    void testCreateRole() {
        when(coreClient.createRole(any(CoreCreateRoleRequest.class)))
                .thenReturn(Role.newBuilder().build());

        RoleDto result =
                guildService.createRole(userId, guildId, "admin", "perm");

        verify(coreClient).createRole(any(CoreCreateRoleRequest.class));
        assertNotNull(result);
    }

    @Test
    void testUpdateRole() {
        when(coreClient.updateRole(any(CoreUpdateRoleRequest.class)))
                .thenReturn(Role.newBuilder().build());

        GuildController.RoleBody body = new GuildController.RoleBody();
        body.setRoleName("admin");
        body.setPermissions("perm");

        RoleDto result =
                guildService.updateRole(userId, guildId, roleId, body);

        verify(coreClient).updateRole(any(CoreUpdateRoleRequest.class));
        assertNotNull(result);
    }

    @Test
    void testAddUserToGuild() {
        when(coreClient.addUser(any(CoreAddUserRequest.class)))
                .thenReturn(GuildUser.newBuilder().build());

        GuildUserDto result =
                guildService.addUserToGuild(userId, guildId);

        verify(coreClient).addUser(any(CoreAddUserRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetGuildUsers() {
        when(coreClient.getGuildUsers(any(CoreGetGuildUsersRequest.class)))
                .thenReturn(List.of(GuildUser.newBuilder().build()));

        GuildUserListDto result =
                guildService.getGuildUsers(userId, guildId);

        verify(coreClient).getGuildUsers(any(CoreGetGuildUsersRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetGuildUser() {
        when(coreClient.getGuildUser(any(CoreGetGuildUserRequest.class)))
                .thenReturn(GuildUser.newBuilder().build());

        GuildUserDto result =
                guildService.getGuildUser(userId, guildId, guildUserId);

        verify(coreClient).getGuildUser(any(CoreGetGuildUserRequest.class));
        assertNotNull(result);
    }

    @Test
    void testUpdateGuildUser() {
        when(coreClient.updateGuildUser(any(CoreUpdateGuildUserRequest.class)))
                .thenReturn(GuildUser.newBuilder().build());

        GuildController.GuildUserBody body =
                new GuildController.GuildUserBody();
        body.setNick("nick");

        GuildUserDto result =
                guildService.updateGuildUser(userId, guildId, guildUserId, body);

        verify(coreClient).updateGuildUser(any(CoreUpdateGuildUserRequest.class));
        assertNotNull(result);
    }

    @Test
    void testDeleteGuildUser() {
        doNothing().when(coreClient)
                .deleteGuildUser(any(CoreDeleteGuildUserRequest.class));

        ResponseMessageDto result =
                guildService.deleteGuildUser(userId, guildId, guildUserId);

        verify(coreClient).deleteGuildUser(any(CoreDeleteGuildUserRequest.class));
        assertNotNull(result);
    }
}
