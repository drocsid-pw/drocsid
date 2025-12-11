package com.drocsid.grpc;

import com.drocsid.grpc.auth.JwtAuthDemo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;


@SpringBootApplication
public class DrocsidApplication {
    public static void main(String[] args) {
        SpringApplication.run(DrocsidApplication.class, args);
    }

    @Bean
    public CommandLineRunner runJwtAuthDemo(JwtAuthDemo jwtAuthDemo) {
        return args -> {
            jwtAuthDemo.mockupAuthDemo();
        };
    }
}
