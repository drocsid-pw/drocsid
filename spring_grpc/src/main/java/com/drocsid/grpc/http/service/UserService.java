package com.drocsid.grpc.http.service;

import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.http.controller.UserController;
import com.drocsid.grpc.http.dto.GuildListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.dto.UserDto;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.mappings.UserCallerMappingRepository;
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
    private final UserCallerMappingRepository repository;

    public UserService(CoreClient coreClient, UserCallerMappingRepository repository) {
        this.coreClient = coreClient;
        this.repository = repository;
    }

    public UserDto createUser(String authedUserId, String name) {
        // if (body == null || body.getName() == null || body.getName().trim().isEmpty()) {
        //     throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        // }
        
        System.out.println("Auth_ID: " + authedUserId);
        System.out.println("Name: " + name);

        CreateUserRequest req = CreateUserRequest.newBuilder()
                .setName(name)
                .build();

        User user = coreClient.createUser(req);

        return ProtoMapper.toDto(user);
    }

    public UserDto getUser(String authedUserId) throws NoSuchFieldException {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new NoSuchFieldException("Invalid token id."))
                .getCallerId();

        User user = coreClient.getUser(callerId);
        return ProtoMapper.toDto(user);
    }

    public UserDto updateUser(String authedUserId, String userId, UserController.PutUserBody body) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        if (body == null) {
            throw Status.INVALID_ARGUMENT.withDescription("body is required").asRuntimeException();
        }

        CoreUpdateUserRequest request = new CoreUpdateUserRequest(
                callerId,
                body.getName(),
                body.getAvatarHash()
        );

        User user = coreClient.updateUser(request);
        return ProtoMapper.toDto(user);
    }

    public ResponseMessageDto deleteUser(String authedUserId, String userId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        coreClient.deleteUser(callerId);
        return new ResponseMessageDto("User deleted successfully.");
    }

    public GuildListDto getAllGuilds(String authedUserId, String userId) throws Exception{
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        List<Guild> guilds = coreClient.getAllGuilds(callerId);
        return ProtoMapper.toGuildListDto(guilds);
    }
}