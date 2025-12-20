package com.drocsid.grpc.http.error;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class ApiErrorResponse {

    private ErrorBody error;

    @Data
    @AllArgsConstructor
    public static class ErrorBody {
        private String code;
        private String message;
        private Map<String, Object> details;
    }

    public static ApiErrorResponse of(String code, String message) {
        return new ApiErrorResponse(new ErrorBody(code, message, Map.of()));
    }
}
