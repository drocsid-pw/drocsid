package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Request struct {
	File     []byte `json:"file"`
	FileName string `json:"filename"`
	SASToken string `json:"sasToken"`
}

type Response struct {
	Message string `json:"message"`
	FileUrl string `json:"url"`
}

// func uploadVideoHandler(w http.ResponseWriter, r *http.Request) {

// 	// VIDEO
// 	video, _ := os.ReadFile("media/video.mp4")

// 	UploadVideo(video, "video.mp4", sasToken)
// }

func uploadImageHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	log.Printf("Received SAS Token: %s", req.SASToken)
	log.Printf("Received file with %d bytes", len(req.File))

	standard_jpg, err := CompressJPG(req.File, 100, 1)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while compressing file", http.StatusInternalServerError)
		return
	}

	standard_compressed, err := CompressJPG(req.File, 80, 2)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while compressing file", http.StatusInternalServerError)
		return
	}

	extreme_compressed, err := CompressJPG(req.File, 60, 4)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while compressing file", http.StatusInternalServerError)
		return
	}

	// small_compressed, err := CompressJPG(req.File, 10, 4)
	// if err != nil {
	// 	log.Fatal(err)
	// 	http.Error(w, "Error while compressing file", http.StatusInternalServerError)
	// 	return
	// }

	// os.WriteFile("media/standard_jpg.jpg", standard_jpg, 0644)
	// os.WriteFile("media/standard_compressed.jpg", standard_compressed, 0644)
	// os.WriteFile("media/small_standard.jpg", small_standard, 0644)
	// os.WriteFile("media/small_compressed.jpg", small_compressed, 0644)

	// var url string
	// UploadImage(original, "original.png", sasToken)
	url, err := UploadImage(standard_jpg, req.FileName+".jpg", req.SASToken)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while compressing file", http.StatusInternalServerError)
		return
	}

	_, err = UploadImage(standard_compressed, req.FileName+"_.jpg", req.SASToken)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while compressing file", http.StatusInternalServerError)
		return
	}

	_, err = UploadImage(extreme_compressed, req.FileName+"__.jpg", req.SASToken)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while compressing file", http.StatusInternalServerError)
		return
	}
	// UploadImage(small_compressed, "small_compressed.jpg", req.SASToken)

	resp := Response{
		Message: "File(s) uploaded successfully",
		FileUrl: url,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/uploadImage", uploadImageHandler)
	// http.HandleFunc("/uploadVideo", uploadVideoHandler)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
