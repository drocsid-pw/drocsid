package com.drocsid.grpc.http.service;

import com.azure.json.implementation.jackson.core.JsonProcessingException;
import com.drocsid.grpc.http.dto.MediaDto;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.drocsid.grpc.http.util.SASGenerator;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.stereotype.Service;

@Service
public class MediaService {

    private static final String API_URL = "http://mediaproxy:9000/";
    private static final String IMAGE_ENDPOINT = "uploadImage";
    private static final String VIDEO_ENDPOINT = "uploadVideo";
    private static final String ACCOUNT_NAME = System.getenv("AZURE_STORAGE_ACCOUNT");
    private static final String CONTAINER_NAME = "drocsid";
    private static final String ACCOUNT_KEY = System.getenv("AZURE_STORAGE_ACCOUNT_KEY");

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public MediaDto uploadImage(String file, String filename) {
        try {
            String sasToken = SASGenerator.generateContainerSas(ACCOUNT_NAME, CONTAINER_NAME, ACCOUNT_KEY);

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("file", file);
            payload.put("filename", filename);
            payload.put("sasToken", sasToken);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL + IMAGE_ENDPOINT))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new RuntimeException("Failed to upload image: " + response.statusCode() + " " + response.body());
            }

            return objectMapper.readValue(response.body(), MediaDto.class);
        }
        catch (InterruptedException e) {
            throw new RuntimeException("Upload image failed. InterruptedException", e);
        }
        catch (JsonProcessingException e) {
            throw new RuntimeException("Upload image failed. JsonProcessingException", e);
        }
        catch (JsonMappingException e) {
            throw new RuntimeException("Upload image failed. JsonMappingException", e);
        }
        catch (IOException e) {
            throw new RuntimeException("Upload image failed. IOException", e);
        }
    }

    public MediaDto uploadVideo(String file, String filename) {
        try {
            String sasToken = SASGenerator.generateContainerSas(ACCOUNT_NAME, CONTAINER_NAME, ACCOUNT_KEY);

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("file", file);
            payload.put("filename", filename);
            payload.put("sasToken", sasToken);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL + VIDEO_ENDPOINT))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new RuntimeException("Failed to upload video: " + response.statusCode() + " " + response.body());
            }

            return objectMapper.readValue(response.body(), MediaDto.class);
        }
        catch (InterruptedException e) {
            throw new RuntimeException("Upload video failed. InterruptedException", e);
        }
        catch (JsonProcessingException e) {
            throw new RuntimeException("Upload video failed. JsonProcessingException", e);
        }
        catch (JsonMappingException e) {
            throw new RuntimeException("Upload video failed. JsonMappingException", e);
        }
        catch (IOException e) {
            throw new RuntimeException("Upload video failed. IOException", e);
        }
    }
}