package com.drocsid.grpc.service;

import com.drocsid.grpc.core_requests.update.CoreUpdateUserRequest;
import com.drocsid.grpc.mock_classes.CoreClient;
import com.drocsid.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigInteger;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private CoreClient coreClient;
    private UserService userService;

    @BeforeEach
    void setUp() {
        coreClient = mock(CoreClient.class);
        userService = new UserService(coreClient);
    }

    @Test
    void testCreateUser() {
        CreateUserRequest request = CreateUserRequest.newBuilder()
                .setName("John")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.createUser(request, observer);

        verify(coreClient).createUser(request);
        assertTrue(observer.completed);
        assertEquals("User created successfully.", observer.value.getText());
    }

    @Test
    void testCreateUserException() {
        CreateUserRequest request = CreateUserRequest.newBuilder()
                .setName("John")
                .build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).createUser(request);

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.createUser(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetUser() {
        User expected = User.newBuilder()
                .setId("1")
                .setName("Alex")
                .setAvatarLetter("A")
                .setAvatarHash("1234")
                .build();

        when(coreClient.getUser(new BigInteger("1"))).thenReturn(expected);

        TestObserver<User> observer = new TestObserver<>();

        userService.getUser(UserId.newBuilder().setId("1").build(), observer);

        verify(coreClient).getUser(new BigInteger("1"));
        assertTrue(observer.completed);
        assertEquals(expected, observer.value);
    }

    @Test
    void testGetUserException() {
        when(coreClient.getUser(new BigInteger("1")))
                .thenThrow(new RuntimeException("error"));

        TestObserver<User> observer = new TestObserver<>();

        userService.getUser(UserId.newBuilder().setId("1").build(), observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testUpdateUser() {
        UpdateUserRequest request = UpdateUserRequest.newBuilder()
                .setId("1")
                .setName("New Name")
                .setAvatarLetter("New Avatar Letter")
                .setAvatarHash("New Avatar Hash")
                .build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.updateUser(request, observer);

        ArgumentCaptor<CoreUpdateUserRequest> captor =
                ArgumentCaptor.forClass(CoreUpdateUserRequest.class);

        verify(coreClient).updateUser(captor.capture());

        assertTrue(observer.completed);
        assertEquals("User updated successfully.", observer.value.getText());
    }

    @Test
    void testUpdateUserException() {
        UpdateUserRequest request = UpdateUserRequest.newBuilder()
                .setId("123")
                .setName("NewName")
                .build();

        doThrow(new RuntimeException("error"))
                .when(coreClient).updateUser(any());

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.updateUser(request, observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testDeleteUser() {
        UserId id = UserId.newBuilder().setId("99").build();

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.deleteUser(id, observer);

        verify(coreClient).deleteUser(new BigInteger("99"));
        assertTrue(observer.completed);
        assertEquals("User deleted successfully.", observer.value.getText());
    }

    @Test
    void testDeleteUserException() {
        doThrow(new RuntimeException("error"))
                .when(coreClient).deleteUser(new BigInteger("99"));

        TestObserver<ResponseMessage> observer = new TestObserver<>();

        userService.deleteUser(UserId.newBuilder().setId("99").build(), observer);

        assertTrue(observer.error);
        assertFalse(observer.completed);
    }

    @Test
    void testGetAllUsers() {
        User user1 = User.newBuilder()
                .setId("1")
                .setName("AAA")
                .setAvatarLetter("A")
                .setAvatarHash("1234")
                .build();
        User user2 = User.newBuilder()
                .setId("2")
                .setName("BBB")
                .setAvatarLetter("B")
                .setAvatarHash("5678")
                .build();

        when(coreClient.getAllUsers()).thenReturn(List.of(user1, user2));

        TestObserver<UserList> observer = new TestObserver<>();

        userService.getAllUsers(Empty.newBuilder().build(), observer);

        verify(coreClient).getAllUsers();
        assertTrue(observer.completed);
        assertEquals(2, observer.value.getUsersCount());
        assertEquals(user1, observer.value.getUsers(0));
        assertEquals(user2, observer.value.getUsers(1));
    }

    @Test
    void testGetAllUsersException() {
        when(coreClient.getAllUsers())
                .thenThrow(new RuntimeException("error"));

        TestObserver<UserList> observer = new TestObserver<>();

        userService.getAllUsers(Empty.newBuilder().build(), observer);

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
