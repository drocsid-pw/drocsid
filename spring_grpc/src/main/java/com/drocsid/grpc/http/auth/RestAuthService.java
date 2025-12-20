package com.drocsid.grpc.http.auth;

import com.drocsid.grpc.auth.JwtAuthService;
import io.grpc.StatusRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RestAuthService {

    private static final Logger logger = LoggerFactory.getLogger(RestAuthService.class);

    private final JwtAuthService jwtAuthService;

    public RestAuthService(JwtAuthService jwtAuthService) {
        this.jwtAuthService = jwtAuthService;
    }

    /**
     * Authenticates by Google ID token from Authorization header.
     * If caller_id is provided and does not match token subject, we keep existing behavior:
     * token wins and caller_id is ignored (we only log a warning).
     */
    public String authenticateAndGetUserId(String authorizationHeader, Optional<String> callerId) throws StatusRuntimeException {
        String userIdFromToken = jwtAuthService.checkAuth(authorizationHeader);

        if (callerId.isPresent() && !callerId.get().equals(userIdFromToken)) {
            logger.warn(
                "caller_id {} does not match token subject {}. Ignoring caller_id and using token subject.",
                callerId.get(),
                userIdFromToken
            );
        }

        return userIdFromToken;
    }
}
