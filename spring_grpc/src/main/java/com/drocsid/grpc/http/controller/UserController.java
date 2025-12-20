package com.drocsid.grpc.http.controller;

import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.http.auth.RestAuthService;
import com.drocsid.grpc.http.dto.GuildListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.dto.UserDto;
import com.drocsid.grpc.http.mapper.ProtoMapper;
import com.drocsid.grpc.http.util.IdParser;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.CreateUserRequest;
import com.drocsid.grpc.proto.Guild;
import com.drocsid.grpc.proto.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.grpc.Status;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final CoreClient coreClient;
    private final RestAuthService restAuthService;

    public UserController(CoreClient coreClient, RestAuthService restAuthService) {
        this.coreClient = coreClient;
        this.restAuthService = restAuthService;
    }

    @PostMapping
    public UserDto createUser(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody CreateUserBody body
    ) {
        restAuthService.authenticateAndGetUserId(authorization, Optional.empty());

        if (body == null || body.getName() == null || body.getName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        CreateUserRequest req = CreateUserRequest.newBuilder()
            .setName(body.getName())
            .build();

        User user = coreClient.createUser(req);
        return ProtoMapper.toDto(user);
    }

    @GetMapping("/{userId}")
    public UserDto getUser(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String userId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        BigInteger targetUserId = IdParser.toBigInteger(userId, "userId");
        User user = coreClient.getUser(targetUserId);

        return ProtoMapper.toDto(user);
    }

    @PutMapping("/{userId}")
    public UserDto putUser(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String userId,
        @RequestBody PutUserBody body
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(
            authorization,
            Optional.ofNullable(body == null ? null : body.getCallerId())
        );

        if (body == null) {
            throw Status.INVALID_ARGUMENT.withDescription("body is required").asRuntimeException();
        }

        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        CoreUpdateUserRequest request = new CoreUpdateUserRequest(
            IdParser.toBigInteger(authedUserId, "userId"),
            body.getName(),
            body.getAvatarHash()
        );

        User user = coreClient.updateUser(request);
        return ProtoMapper.toDto(user);
    }

    @DeleteMapping("/{userId}")
    public ResponseMessageDto deleteUser(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String userId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        coreClient.deleteUser(IdParser.toBigInteger(authedUserId, "userId"));
        return new ResponseMessageDto("User deleted successfully.");
    }

    @GetMapping("/{userId}/guilds")
    public GuildListDto getAllGuilds(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable String userId,
        @RequestParam(value = "caller_id", required = false) String callerId
    ) {
        String authedUserId = restAuthService.authenticateAndGetUserId(authorization, Optional.ofNullable(callerId));

        if (!userId.equals(authedUserId)) {
            throw Status.PERMISSION_DENIED.withDescription("User ID mismatch").asRuntimeException();
        }

        List<Guild> guilds = coreClient.getAllGuilds(IdParser.toBigInteger(authedUserId, "userId"));
        return ProtoMapper.toGuildListDto(guilds);
    }

    @Data
    private static class CreateUserBody {
        private String name;
    }

    @Data
    private static class PutUserBody {
        @JsonProperty("caller_id")
        private String callerId;

        private String name;
        private String avatarHash;
    }
}
