package com.drocsid.grpc.http.controller;

import org.springframework.web.bind.annotation.*;

import com.drocsid.grpc.auth.JwtAuthService;
import com.drocsid.grpc.http.dto.ImageDto;
import com.drocsid.grpc.http.service.MediaService;

import jakarta.validation.Valid;
import lombok.Data;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;
    private final JwtAuthService jwtAuthService;

    public MediaController(MediaService mediaService, JwtAuthService jwtAuthService) {
        this.mediaService = mediaService;
        this.jwtAuthService = jwtAuthService;
    }
    
    @PostMapping("/uploadImage")
    public ImageDto uploadImage(
            // @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody UploadImageBody body) {

        // String authedUserId = jwtAuthService.checkAuth(authorization);
        String file = body.getFile();
        String filename = body.getFilename();

        try {
            return mediaService.uploadImage(file, filename);
        }
        catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @Data
    public static class UploadImageBody {
        private String file;
        private String filename;
    }
}
