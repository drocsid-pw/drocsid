package com.drocsid.grpc.http.service;

import com.drocsid.grpc.http.dto.ImageDto;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.drocsid.grpc.http.util.SASGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.stereotype.Service;

@Service
public class MediaService {

    private static final String API_URL = "http://127.0.0.1:8080/uploadImage";
    private static final String ACCOUNT_NAME = "devstoreaccount1";
    private static final String CONTAINER_NAME = "drocsid";
    private static final String ACCOUNT_KEY = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public ImageDto uploadImage(String file, String filename) {
        try {
            String sasToken = SASGenerator.generateContainerSas(ACCOUNT_NAME, CONTAINER_NAME, ACCOUNT_KEY);

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("file", file);
            payload.put("filename", filename);
            payload.put("sasToken", sasToken);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new RuntimeException("Failed to upload image: " + response.statusCode() + " " + response.body());
            }

            return objectMapper.readValue(response.body(), ImageDto.class);
        }
        catch (Exception e) {
            throw new RuntimeException("Upload image failed", e);
        }
    }
}