package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.http.controller.UserController;
import com.drocsid.grpc.http.dto.GuildListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.dto.UserDto;
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
class UserServiceTest {

    @Mock
    private CoreClient coreClient;

    @InjectMocks
    private UserService userService;

    private final String userId = "1";

    @Test
    void testCreateUser() {
        when(coreClient.createUser(any(CreateUserRequest.class)))
                .thenReturn(User.newBuilder().build());

        UserController.CreateUserBody body =
                new UserController.CreateUserBody();
        body.setName("user");

        UserDto result = userService.createUser(body);

        verify(coreClient).createUser(any(CreateUserRequest.class));
        assertNotNull(result);
    }

    @Test
    void testGetUser() {
        when(coreClient.getUser(any()))
                .thenReturn(User.newBuilder().build());

        UserDto result = userService.getUser(userId);

        verify(coreClient).getUser(any());
        assertNotNull(result);
    }

    @Test
    void testUpdateUser() {
        when(coreClient.updateUser(any(CoreUpdateUserRequest.class)))
                .thenReturn(User.newBuilder().build());

        UserController.PutUserBody body =
                new UserController.PutUserBody();
        body.setName("new-name");

        UserDto result =
                userService.updateUser(userId, userId, body);

        verify(coreClient).updateUser(any(CoreUpdateUserRequest.class));
        assertNotNull(result);
    }

    @Test
    void testDeleteUser() {
        doNothing().when(coreClient).deleteUser(any());

        ResponseMessageDto result =
                userService.deleteUser(userId, userId);

        verify(coreClient).deleteUser(any());
        assertNotNull(result);
    }

    @Test
    void testGetAllGuilds() {
        when(coreClient.getAllGuilds(any()))
                .thenReturn(List.of(Guild.newBuilder().build()));

        GuildListDto result =
                userService.getAllGuilds(userId, userId);

        verify(coreClient).getAllGuilds(any());
        assertNotNull(result);
    }
}
