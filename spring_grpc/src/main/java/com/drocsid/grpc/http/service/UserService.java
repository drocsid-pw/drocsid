package com.drocsid.grpc.http.service;

import com.drocsid.grpc.http.controller.UserController;
import com.drocsid.grpc.http.dto.GuildListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.dto.UserDto;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.mappings.UserCallerMapping;
import com.drocsid.grpc.mappings.UserCallerMappingRepository;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
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

        UserCallerMapping mapping = new UserCallerMapping();
        mapping.setTokenId(authedUserId);
        mapping.setCallerId(new BigInteger(user.getId()));

        repository.saveAndFlush(mapping);


        return ProtoMapper.toDto(user);
    }

    public UserDto getUser(String authedUserId) throws NoSuchFieldException {
        String callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new NoSuchFieldException("Invalid token id."))
                .getCallerId().toString();

        UserId userId = UserId.newBuilder().setCallerId(callerId).build();
        User user = coreClient.getUser(userId);
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

        UpdateUserRequest request = UpdateUserRequest.newBuilder()
                .setCallerId(String.valueOf(callerId))
                .setName(body.getName())
                .setAvatarHash(body.getAvatarHash())
                .build();

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

        UserId userIdToCore = UserId.newBuilder().setCallerId(String.valueOf(callerId)).build();
        coreClient.deleteUser(userIdToCore);
        return new ResponseMessageDto("User deleted successfully.");
    }

    public GuildListDto getAllGuilds(String authedUserId, String userId) throws Exception {
        BigInteger callerId = repository.findByTokenId(authedUserId)
                .orElseThrow(() -> new Exception("Invalid token id."))
                .getCallerId();

        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        UserId userIdForCore = UserId.newBuilder().setCallerId(String.valueOf(callerId)).build();
        List<Guild> guilds = coreClient.getAllGuilds(userIdForCore);
        return ProtoMapper.toGuildListDto(guilds);
    }
}
