package com.drocsid.grpc.mock_classes;

import com.drocsid.grpc.proto.CreateUserRequest;
import com.drocsid.grpc.proto.UpdateUserRequest;
import org.springframework.stereotype.Component;
import com.drocsid.grpc.proto.*;

import java.util.List;

@Component
public class CoreClient {

    public void createUser(CreateUserRequest request) {}

    public User getUser(String id) {
        return User.newBuilder()
                .setId(id)
                .setName("Mock User")
                .setAvatarLetter("M")
                .setStatus(DrocsidStatus.ONLINE)
                .build();
    }

    public void updateUser(UpdateUserRequest request) {}

    public void deleteUser(String userId) {}

    public List<User> listUsers() {
        return List.of();
    }

    public void createMessage(CreateMessageRequest request) {}

    public Message getMessage(String userId, String messageId) {
        return Message.newBuilder()
                .setId(messageId)
                .setUser("Mock User")
                .setTime("2025-01-01T20-00-00")
                .setText("hello")
                .build();
    }

    public void updateMessage(UpdateMessageRequest request) {}

    public void deleteMessage(String userId, String messageId) {}
}
