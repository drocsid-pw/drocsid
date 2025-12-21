package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Request struct {
	File     []byte `json:"file"`
	FileName string `json:"filename"`
	CdnUrl   string `json:"cdnUrl"`
	SASToken string `json:"sasToken"`
}

type Response struct {
	Message string `json:"message"`
	FileUrl string `json:"url"`
}

func uploadVideoHandler(w http.ResponseWriter, r *http.Request) {

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

	url, err := AzuriteUploadVideo(req.File, req.CdnUrl, req.FileName+".mp4", req.SASToken)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while uploading file", http.StatusInternalServerError)
		return
	}

	resp := Response{
		Message: "File uploaded successfully",
		FileUrl: url,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)

}

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

	url, err := AzuriteUploadImage(standard_jpg, req.CdnUrl, req.FileName+".jpg", req.SASToken)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while uploading file", http.StatusInternalServerError)
		return
	}

	_, err = AzuriteUploadImage(standard_compressed, req.CdnUrl, req.FileName+"_.jpg", req.SASToken)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while uploading file", http.StatusInternalServerError)
		return
	}

	_, err = AzuriteUploadImage(extreme_compressed, req.CdnUrl, req.FileName+"__.jpg", req.SASToken)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Error while uploading file", http.StatusInternalServerError)
		return
	}

	resp := Response{
		Message: "File(s) uploaded successfully",
		FileUrl: url,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/uploadImage", uploadImageHandler)
	http.HandleFunc("/uploadVideo", uploadVideoHandler)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
