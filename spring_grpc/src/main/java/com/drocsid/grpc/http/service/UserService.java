package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.http.controller.UserController;
import com.drocsid.grpc.http.dto.GuildListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.dto.UserDto;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.CreateUserRequest;
import com.drocsid.grpc.proto.Guild;
import com.drocsid.grpc.proto.User;
import io.grpc.Status;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

@Service
public class UserService {

    private final CoreClient coreClient;

    public UserService(CoreClient coreClient) {
        this.coreClient = coreClient;
    }

    public UserDto createUser(UserController.CreateUserBody body) {
        if (body == null || body.getName() == null || body.getName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CreateUserRequest req = CreateUserRequest.newBuilder()
                .setName(body.getName())
                .build();

        User user = coreClient.createUser(req);
        return ProtoMapper.toDto(user);
    }

    public UserDto getUser(String authedUserId) {
        BigInteger targetUserId = IdParser.toBigInteger(authedUserId, "userId");
        User user = coreClient.getUser(targetUserId);
        return ProtoMapper.toDto(user);
    }

    public UserDto updateUser(String authedUserId, String userId, UserController.PutUserBody body) {
        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        if (body == null) {
            throw Status.INVALID_ARGUMENT.withDescription("body is required").asRuntimeException();
        }

        CoreUpdateUserRequest request = new CoreUpdateUserRequest(
                IdParser.toBigInteger(authedUserId, "userId"),
                body.getName(),
                body.getAvatarHash()
        );

        User user = coreClient.updateUser(request);
        return ProtoMapper.toDto(user);
    }

    public ResponseMessageDto deleteUser(String authedUserId, String userId) {
        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        coreClient.deleteUser(IdParser.toBigInteger(authedUserId, "userId"));
        return new ResponseMessageDto("User deleted successfully.");
    }

    public GuildListDto getAllGuilds(String authedUserId, String userId) {
        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        List<Guild> guilds = coreClient.getAllGuilds(IdParser.toBigInteger(authedUserId, "userId"));
        return ProtoMapper.toGuildListDto(guilds);
    }
}