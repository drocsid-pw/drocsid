package main

import (
	"log"
	"os"
)

func main() {
	original, _ := os.ReadFile("media/original.png")

	standard_jpg, err := CompressJPG(original, 100, 1)
	if err != nil {
		log.Fatal(err)
	}

	standard_compressed, err := CompressJPG(original, 10, 1)
	if err != nil {
		log.Fatal(err)
	}

	small_standard, err := CompressJPG(original, 100, 4)
	if err != nil {
		log.Fatal(err)
	}

	small_compressed, err := CompressJPG(original, 10, 4)
	if err != nil {
		log.Fatal(err)
	}

	os.WriteFile("media/standard_jpg.jpg", standard_jpg, 0644)
	os.WriteFile("media/standard_compressed.jpg", standard_compressed, 0644)
	os.WriteFile("media/small_standard.jpg", small_standard, 0644)
	os.WriteFile("media/small_compressed.jpg", small_compressed, 0644)

	// READ SAS TOKEN
	tokenBytes, err := os.ReadFile("sas.txt")
	if err != nil {
		log.Fatal(err)
	}
	sasToken := string(tokenBytes)

	UploadImage(original, "original.png", sasToken)
	UploadImage(standard_jpg, "standard_jpg.jpg", sasToken)
	UploadImage(standard_compressed, "standard_compressed.jpg", sasToken)
	UploadImage(small_standard, "small_standard.jpg", sasToken)
	UploadImage(small_compressed, "small_compressed.jpg", sasToken)

	// VIDEO
	video, _ := os.ReadFile("media/video.mp4")

	UploadVideo(video, "video.mp4", sasToken)
}
