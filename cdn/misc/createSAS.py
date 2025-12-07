from azure.storage.blob import BlobSasPermissions, ContentSettings, generate_container_sas
from datetime import datetime, timedelta, UTC

# Azurite settings
account_name = "devstoreaccount1"
account_key = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="  # default Azurite key
container_name = "drocsid"

sas_token = generate_container_sas(
    account_name=account_name,
    container_name=container_name,
    account_key=account_key,
    permission=BlobSasPermissions(read=True, write=True, create=True),
    expiry=datetime.now(UTC) + timedelta(hours=24)
)

with open("sas.txt", 'w') as file:
    file.write(sas_token)