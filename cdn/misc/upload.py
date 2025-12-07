from azure.storage.blob import BlobServiceClient, ContentSettings
import os

# Azurite defaults
AZURITE_URL = "http://127.0.0.1:10000/devstoreaccount1"
ACCOUNT_NAME = "devstoreaccount1"
ACCOUNT_KEY = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="  # Default Azurite key
CONTAINER_NAME = "drocsid"
BLOB_NAME = "image.png"
FILE_PATH = "image.png"

# Connect to Azurite using account key
connection_string = (
    f"DefaultEndpointsProtocol=http;"
    f"AccountName={ACCOUNT_NAME};"
    f"AccountKey={ACCOUNT_KEY};"
    f"BlobEndpoint={AZURITE_URL};"
)
blob_service_client = BlobServiceClient.from_connection_string(connection_string)

# Create container if it does not exist
container_client = blob_service_client.get_container_client(CONTAINER_NAME)
try:
    container_client.create_container()
except Exception:
    pass

# Upload file
with open(FILE_PATH, "rb") as data:
    container_client.upload_blob(
        name=BLOB_NAME,
        data=data,
        overwrite=True,
        content_settings=ContentSettings(content_type="image/png")  # ensures viewable in browser
    )

# Construct URL to view
url = f"{AZURITE_URL}/{CONTAINER_NAME}/{BLOB_NAME}"
print(f"Upload successful! View the image at:\n{url}")