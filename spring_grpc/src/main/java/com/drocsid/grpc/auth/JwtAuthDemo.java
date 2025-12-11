package com.drocsid.grpc.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Demo component for testing JWT authentication on application startup.
 */
@Component
public class JwtAuthDemo {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthDemo.class);
    private final JwtAuthService jwtAuthService;

    public JwtAuthDemo(JwtAuthService jwtAuthService) {
        this.jwtAuthService = jwtAuthService;
    }

    public void mockupAuthDemo() {
        logger.info("========================================");
        logger.info("Starting JWT Authentication Demo");
        logger.info("========================================");

        String MOCK_JWT_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ1NDNlMjFhMDI3M2VmYzY2YTQ3NTAwMDI0NDFjYjIxNTFjYjIzNWYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0OTQzNzU4NTM0ODgtbnU1aDZic2ZmamFmbzNzMnNyZGRpanJnc3RxdnM3bmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0OTQzNzU4NTM0ODgtbnU1aDZic2ZmamFmbzNzMnNyZGRpanJnc3RxdnM3bmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDA2Mzg1NDU4MDA3MTQ4NDU2NjMiLCJlbWFpbCI6Im1hdGRhczEyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3NjU0NDU0NDksIm5hbWUiOiJNYXRldXN6IERhc3pld3NraSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMLXNwdm93LXZLNi1RaGVIX2VyY3FWUnBCUkFQZVBoZTJrZ0s0NWVDXzdCQlVSRHcwPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Ik1hdGV1c3oiLCJmYW1pbHlfbmFtZSI6IkRhc3pld3NraSIsImlhdCI6MTc2NTQ0NTc0OSwiZXhwIjoxNzY1NDQ5MzQ5LCJqdGkiOiI1ZDc5ODVlYWRmYzRkYWQ4NTJmOGViYTAxNWU4ZDMwNmE5MDlhMmEzIn0.lTVH-0Cds4yPALz1RZTIv9bS97H_61RwRT4eKzH2owoghtrbFivkl_CrjPdf3J2WgqyH1QrE9aPDou8v_-hU447Rt2fKW57WCH9wNxE2emx59ELBMszMjpuPlFZANiJbekLL7fL4nz13be6_G3-huY-aCpJd1s73SRcfHAYGxS-81JZWh9u8axogcphG9TNwDm7v9HaVKvBKymNTevi3rycw_3hz6-WFM4oU0Ztr8R5ZA7sWpB7dO7_pRBElETLG78nXDP13GGREWRDuDpZppFUT7oOtQ1UIQUTRoY1zIlNdLZgPJ_zyAJKImQK3xgp2WpP5LNKRPujg8mrebDTWzw";

        try {
            logger.info("Attempting to validate JWT token...");
            String userId = jwtAuthService.checkAuth(MOCK_JWT_TOKEN);

            logger.info("JWT validation SUCCESSFUL");
            logger.info("Extracted User ID: {}", userId);

        } catch (Exception e) {
            logger.error("JWT validation FAILED");
            logger.error("Error: {}", e.getMessage());
            logger.error("Status: {}", e.getClass().getSimpleName());
        }

        logger.info("========================================");
        logger.info("JWT Authentication Demo Completed");
        logger.info("========================================");
    }
}