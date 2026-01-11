package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
)

func AzuriteUploadImage(file []byte, azuriteURL string, name string, sasToken string) (string, error) {
	url := fmt.Sprintf("%s/%s?%s", azuriteURL, name, sasToken)
	retURL := fmt.Sprintf("%s/%s", azuriteURL, name)

	// FOR DEV PURPOSE CHANGE DNS NAME TO LOCALHOST
	retURL = strings.Replace(retURL, "cdn", "localhost", 1)

	reader := bytes.NewReader(file)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodPut, url, reader)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("x-ms-blob-type", "BlockBlob")
	req.Header.Set("Content-Type", "image/png")
	req.ContentLength = int64(len(file))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("upload request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("upload failed (%s): %s", resp.Status, string(body))
	}

	return retURL, nil
}

func AzuriteUploadVideo(file []byte, azuriteURL string, name string, sasToken string) (string, error) {
	url := fmt.Sprintf("%s/%s?%s", azuriteURL, name, sasToken)
	retURL := fmt.Sprintf("%s/%s", azuriteURL, name)

	reader := bytes.NewReader(file)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodPut, url, reader)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("x-ms-blob-type", "BlockBlob")
	req.Header.Set("Content-Type", "video/mp4")
	req.Header.Set("x-ms-blob-content-type", "video/mp4")
	req.Header.Set("x-ms-blob-content-disposition", "inline")
	req.Header.Set("Content-Disposition", "inline")
	req.Header.Set("Cache-Control", "public, max-age=31536000")
	req.Header.Set("x-ms-blob-cache-control", "public, max-age=31536000")
	req.ContentLength = int64(len(file))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("upload request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("upload failed (%s): %s", resp.Status, string(body))
	}

	return retURL, nil
}
