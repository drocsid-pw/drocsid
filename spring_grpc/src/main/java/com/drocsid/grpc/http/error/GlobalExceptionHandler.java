package com.drocsid.grpc.http.error;

import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(StatusRuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleStatusRuntimeException(StatusRuntimeException e) {
        Status status = e.getStatus();

        HttpStatus httpStatus = mapGrpcStatusToHttp(status);
        String code = mapGrpcStatusToCode(status);
        String message = status.getDescription() != null ? status.getDescription() : status.getCode().name();

        return ResponseEntity
            .status(httpStatus)
            .body(ApiErrorResponse.of(code, message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleBadJson(HttpMessageNotReadableException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiErrorResponse.of("BAD_REQUEST", "Invalid JSON body"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception e) {
        logger.error("Unhandled server error", e);

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiErrorResponse.of("INTERNAL", "Unexpected server error"));
    }

    private static HttpStatus mapGrpcStatusToHttp(Status status) {
        switch (status.getCode()) {
            case UNAUTHENTICATED:
                return HttpStatus.UNAUTHORIZED;
            case PERMISSION_DENIED:
                return HttpStatus.FORBIDDEN;
            case NOT_FOUND:
                return HttpStatus.NOT_FOUND;
            case INVALID_ARGUMENT:
                return HttpStatus.BAD_REQUEST;
            case ALREADY_EXISTS:
                return HttpStatus.CONFLICT;
            case FAILED_PRECONDITION:
                return HttpStatus.PRECONDITION_FAILED;
            case UNAVAILABLE:
                return HttpStatus.SERVICE_UNAVAILABLE;
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    private static String mapGrpcStatusToCode(Status status) {
        switch (status.getCode()) {
            case PERMISSION_DENIED:
                return "FORBIDDEN";
            case UNAUTHENTICATED:
                return "UNAUTHENTICATED";
            case INVALID_ARGUMENT:
                return "BAD_REQUEST";
            case NOT_FOUND:
                return "NOT_FOUND";
            case ALREADY_EXISTS:
                return "CONFLICT";
            case FAILED_PRECONDITION:
                return "PRECONDITION_FAILED";
            case UNAVAILABLE:
                return "UNAVAILABLE";
            default:
                return "INTERNAL";
        }
    }
}
