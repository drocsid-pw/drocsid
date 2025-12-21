import base64
import json
import requests
from pathlib import Path

API_URL = "http://localhost:9000/uploadImage"
FILE_PATH = "image.png"
SAS_FILE = "sas.txt"

file_bytes = Path(FILE_PATH).read_bytes()
file_b64 = base64.b64encode(file_bytes).decode("utf-8")

sas_token = Path(SAS_FILE).read_text().strip()

payload = {
    "file": file_b64,
    "filename": Path(FILE_PATH).stem,
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
