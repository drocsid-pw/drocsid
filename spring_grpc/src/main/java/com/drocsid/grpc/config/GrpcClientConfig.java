package com.drocsid.grpc.config;

import com.drocsid.grpc.proto.ChannelServiceGrpc;
import com.drocsid.grpc.proto.GuildServiceGrpc;
import com.drocsid.grpc.proto.UserServiceGrpc;
import org.springframework.beans.factory.annotation.Value;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Value("${core.host}")
    private String coreHost;

    @Value("${core.port}")
    private int corePort;

    @Bean
    public ManagedChannel managedChannel() {
        return ManagedChannelBuilder
                .forAddress(coreHost, corePort)
                .usePlaintext()
                .build();
    }

    @Bean
    public UserServiceGrpc.UserServiceBlockingStub userServiceStub(ManagedChannel channel) {
        return UserServiceGrpc.newBlockingStub(channel);
    }

    @Bean
    public ChannelServiceGrpc.ChannelServiceBlockingStub channelServiceStub(ManagedChannel channel) {
        return ChannelServiceGrpc.newBlockingStub(channel);
    }

    @Bean
    public GuildServiceGrpc.GuildServiceBlockingStub guildServiceStub(ManagedChannel channel) {
        return GuildServiceGrpc.newBlockingStub(channel);
    }
}
