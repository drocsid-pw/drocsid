#!/bin/sh

# Start Azurite Blob Storage service
azurite-blob --blobHost 0.0.0.0 --blobPort 10000 --loose &
AZURITE_PID=$!

# Wait for service to start
while ! nc -z 0.0.0.0 10000; do
  sleep 1
done

echo "Azurite is up."

# Create drocsid container
az storage container create \
  --name drocsid \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=${AZURE_STORAGE_ACCOUNT};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};BlobEndpoint=http://0.0.0.0:10000/${AZURE_STORAGE_ACCOUNT}" \
  --public-access blob

echo "Container 'drocsid' created."

wait $AZURITE_PID
