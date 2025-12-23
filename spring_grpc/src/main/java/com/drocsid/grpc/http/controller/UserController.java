package com.drocsid.grpc.http.controller;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.http.dto.GuildListDto;
import com.drocsid.grpc.http.dto.ResponseMessageDto;
import com.drocsid.grpc.http.dto.UserDto;
import com.drocsid.grpc.http.service.UserService;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtAuthService jwtAuthService;

    public UserController(UserService userService, JwtAuthService jwtAuthService) {
        this.userService = userService;
        this.jwtAuthService = jwtAuthService;
    }

    @PostMapping
    public UserDto createUser(@Valid @RequestBody CreateUserBody body) {

        return userService.createUser(body);
    }

    @GetMapping("/get_user")
    public UserDto getUser(
            @RequestHeader("Authorization") String authorization) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return userService.getUser(authedUserId);
        }
        catch (NoSuchFieldException e){
            return userService.createUser(authedUserId, jwtAuthService.getName(authorization));
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @PutMapping("/{userId}")
    public UserDto putUser(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String userId,
            @Valid @RequestBody PutUserBody body) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return userService.updateUser(authedUserId, userId, body);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseMessageDto deleteUser(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String userId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return userService.deleteUser(authedUserId, userId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{userId}/guilds")
    public GuildListDto getAllGuilds(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String userId) {

        String authedUserId = jwtAuthService.checkAuth(authorization);

        try {
            return userService.getAllGuilds(authedUserId, userId);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @Data
    public static class CreateUserBody {
        private String name;
    }

    @Data
    public static class PutUserBody {
        @JsonProperty("caller_id")
        private String callerId;

        private String name;
        private String avatarHash;
    }
}
