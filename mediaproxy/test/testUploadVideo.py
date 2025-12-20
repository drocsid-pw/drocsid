import base64
import json
import requests
from pathlib import Path

API_URL = "http://127.0.0.1:8080/uploadVideo"
CDN_URL = "http://127.0.0.1:10000/devstoreaccount1/drocsid"
FILE_PATH = "video.mp4"   # file to upload
SAS_FILE = "sas.txt"

# Read file and encode as base64 (required for []byte JSON)
file_bytes = Path(FILE_PATH).read_bytes()
file_b64 = base64.b64encode(file_bytes).decode("utf-8")

# Read SAS token
sas_token = Path(SAS_FILE).read_text().strip()

payload = {
    "file": file_b64,
    "filename": Path(FILE_PATH).stem,
    "cdnUrl": CDN_URL,
    "sasToken": sas_token
}

response = requests.post(
    API_URL,
    headers={"Content-Type": "application/json"},
    data=json.dumps(payload),
)

response.raise_for_status()

data = response.json()
print("Uploaded file URL:", data["url"])
