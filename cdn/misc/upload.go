package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	tokenBytes, err := os.ReadFile("sas.txt")
	if err != nil {
		panic(err)
	}
	sasToken := string(tokenBytes)

	container := "drocsid"
	blobName := "image.png"
	filePath := "image.png"
	account := "devstoreaccount1"
	url := fmt.Sprintf("http://127.0.0.1:10000/%s/%s/%s?%s", account, container, blobName, sasToken)

	file, err := os.Open(filePath)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		panic(err)
	}

	req, err := http.NewRequestWithContext(context.Background(), "PUT", url, file)
	if err != nil {
		panic(err)
	}

	// ALL THIS HEADERS ARE REQUIRED FOR AZURITE
	req.Header.Set("x-ms-blob-type", "BlockBlob")
	req.Header.Set("Content-Type", "image/png")
	req.ContentLength = info.Size()

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		fmt.Println("Upload successful!")
		fmt.Printf("Viewable at: %s\n", url)
	} else {
		fmt.Printf("Upload failed: %s\nResponse: %s\n", resp.Status, string(body))
	}
}
