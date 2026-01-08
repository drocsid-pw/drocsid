package com.drocsid.grpc.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import io.grpc.Status;

import io.grpc.StatusRuntimeException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;


@Service
public class JwtAuthService {

    private final GoogleIdTokenVerifier verifier;

    public JwtAuthService(@Value("${google.oauth.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    @Deprecated
    public String checkAuth(String jwt) throws StatusRuntimeException {
        return checkAuth(jwt, Optional.empty());
    }

    @Deprecated
    public String checkAuth(String jwt, Optional<String> userId) throws StatusRuntimeException {
        if (jwt == null || jwt.trim().isEmpty()) {
            throw Status.UNAUTHENTICATED
                    .withDescription("JWT token is missing")
                    .asRuntimeException();
        }

        String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;

        GoogleIdToken idToken = null;
        try {
            idToken = verifier.verify(token);
        } catch (Exception e) {
            throw Status.UNAUTHENTICATED
                    .withDescription("Failed to verify JWT token: " + e.getMessage())
                    .asRuntimeException();
        }

        if (idToken == null) {
            throw Status.UNAUTHENTICATED
                    .withDescription("Invalid JWT token")
                    .asRuntimeException();
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String userIdFromToken = payload.getSubject();

        if (userId.isPresent() && !userId.get().equals(userIdFromToken)) {
            throw Status.PERMISSION_DENIED
                    .withDescription("User ID mismatch")
                    .asRuntimeException();
        }

        return userIdFromToken;
    }

    private static String decodeJwtPayload(String jwt) {
        String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;
        String[] parts = token.split("\\.");
        if (parts.length != 3) return "Not a JWT";
        return new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
    }

    private GoogleIdToken.Payload getPayload(String jwt) {
        if (jwt == null || jwt.trim().isEmpty()) {
            throw Status.UNAUTHENTICATED
                .withDescription("JWT token is missing")
                .asRuntimeException();
        }

        System.out.println(decodeJwtPayload(jwt));

        String token = jwt.startsWith("Bearer ") ? jwt.substring(7) : jwt;

        GoogleIdToken idToken;
        try {
            System.out.println("Verifying token...");
            idToken = verifier.verify(token);
            System.out.println("Token verified.");
        } 
        catch (Exception e) {
            throw Status.UNAUTHENTICATED
                    .withDescription("Failed to verify JWT token: " + e.getMessage())
                    .asRuntimeException();
        }

        if (idToken == null) {
            System.out.println("Token verification FAILED (idToken == null)");
            throw Status.UNAUTHENTICATED
                    .withDescription("Invalid JWT token")
                    .asRuntimeException();
        }

        return idToken.getPayload();
    }
    
    public String getUserId(String jwt) {
        return getPayload(jwt).getSubject();
    }

    public String getName(String jwt) {
        Object name = getPayload(jwt).get("name");
        System.out.println(name != null ? name.toString() : null);
        return name != null ? name.toString() : null;
    }

}