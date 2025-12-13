package com.drocsid.grpc.service;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.core_requests.user.CoreUpdateUserRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private CoreClient coreClient;
    private UserService userService;

    @BeforeEach
    void setUp() {
        coreClient = mock(CoreClient.class);
        JwtAuthService jwtAuthService = mock(JwtAuthService.class);
        userService = new UserService(coreClient, jwtAuthService);
    }

    @Test
    void testCreateUser() {
        CreateUserRequest request = CreateUserRequest.newBuilder()
                .setName("John")
                .build();

        TestObserver<User> observer = new TestObserver<>();

        userService.createUser(request, observer);

        verify(coreClient).createUser(request);
        assertTrue(observer.completed);
        assertNotNull(observer.value);
        assertInstanceOf(User.class, observer.value);
    }

    @Test
    void testCreateUserException() {
        CreateUserRequest request = CreateUserRequest.newBuilder()
                .setName("John")
                .build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).createUser(request);

        TestObserver<User> observer = new TestObserver<>();

        userService.createUser(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetUser() {
        UserId userIdRequest = UserId.newBuilder().setToken("token").build();

        TestObserver<User> observer = new TestObserver<>();

        userService.getUser(userIdRequest, observer);

        verify(coreClient).getUser(new BigInteger("1"));
        assertTrue(observer.completed);
        assertNotNull(observer.value);
        assertInstanceOf(User.class, observer.value);
    }

    @Test
    void testGetUserException() {
        UserId userIdRequest = UserId.newBuilder().setToken("token").build();

        TestObserver<User> observer = new TestObserver<>();

        userService.getUser(userIdRequest, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testUpdateUser() {
        UpdateUserRequest request = UpdateUserRequest.newBuilder()
                .setToken("token")
                .setName("name")
                .setAvatarHash("hash")
                .build();

        TestObserver<User> observer = new TestObserver<>();

        userService.updateUser(request, observer);

        verify(coreClient).updateUser(new CoreUpdateUserRequest("1", request));
        assertTrue(observer.completed);
        assertNotNull(observer.value);
        assertInstanceOf(User.class, observer.value);
    }

    @Test
    void testUpdateUserException() {
        UpdateUserRequest request = UpdateUserRequest.newBuilder()
                .setToken("token")
                .setName("name")
                .setAvatarHash("hash")
                .build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).updateUser(any());

        TestObserver<User> observer = new TestObserver<>();

        userService.updateUser(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteUser() {
        UserId userIdRequest = UserId.newBuilder().setToken("token").build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.deleteUser(userIdRequest, observer);

        verify(coreClient).deleteUser(new BigInteger("1"));
        assertTrue(observer.completed);
        assertEquals("User deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteUserException() {
        UserId userIdRequest = UserId.newBuilder().setToken("token").build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).deleteUser(new BigInteger("99"));

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.deleteUser(userIdRequest, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    private static class TestObserver<T> implements StreamObserver<T> {

        T value;
        boolean completed = false;
        boolean error = false;

        @Override
        public void onNext(T value) {
            this.value = value;
        }

        @Override
        public void onError(Throwable t) {
            this.error = true;
        }

        @Override
        public void onCompleted() {
            this.completed = true;
        }
    }
}
