package com.drocsid.grpc.mock_classes;

import com.drocsid.grpc.core_requests.CoreCreateMessageRequest;
import com.drocsid.grpc.core_requests.CoreUpdateMessageRequest;
import com.drocsid.grpc.core_requests.CoreUpdateUserRequest;
import com.drocsid.grpc.proto.CreateUserRequest;
import org.springframework.stereotype.Component;
import com.drocsid.grpc.proto.*;

import java.math.BigInteger;
import java.util.List;

@Component
public class CoreClient {

    public void createUser(CreateUserRequest request) {}

    public User getUser(BigInteger id) {
        return User.newBuilder()
                .setId(id.toString())
                .setName("Mock User")
                .setAvatarLetter("M")
                .setAvatarHash("hash")
                .build();
    }

    public void updateUser(CoreUpdateUserRequest request) {}

    public void deleteUser(BigInteger userId) {}

    public List<User> listUsers() {
        return List.of();
    }

    public void createMessage(CoreCreateMessageRequest request) {}

    public Message getMessage(BigInteger userId, BigInteger messageId) {
        return Message.newBuilder()
                .setId(messageId.toString())
                .setAuthorId("id")
                .setAuthorName("name")
                .setContent("content")
                .setChannelId("channelId")
                .build();
    }

    public void updateMessage(CoreUpdateMessageRequest request) {}

    public void deleteMessage(BigInteger userId, BigInteger messageId) {}
}
