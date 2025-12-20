from azure.storage.blob import BlobSasPermissions, ContentSettings, generate_container_sas
from datetime import datetime, timedelta, UTC
from dotenv import load_dotenv
import os

load_dotenv()

# Azurite settings
account_name = os.getenv("AZURE_STORAGE_ACCOUNT")
account_key = os.getenv("AZURE_STORAGE_KEY")
container_name = os.getenv("AZURE_STORAGE_CONTAINER")

sas_token = generate_container_sas(
    account_name=account_name,
    container_name=container_name,
    account_key=account_key,
    permission=BlobSasPermissions(read=True, write=True, create=True),
    expiry=datetime.now(UTC) + timedelta(hours=24)
)

with open("sas.txt", 'w') as file:
    file.write(sas_token)