package com.drocsid.grpc.http.controller;

import com.drocsid.grpc.http.dto.HelloReplyDto;
import io.grpc.Status;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HelloController {

    @PostMapping("/hello")
    public HelloReplyDto hello(@RequestBody HelloBody body) {
        if (body == null || body.getName() == null || body.getName().trim().isEmpty()) {
            throw Status.INVALID_ARGUMENT.withDescription("name is required").asRuntimeException();
        }

        return new HelloReplyDto("Hello " + body.getName());
    }

    @Data
    private static class HelloBody {
        private String name;
    }
}
