#!/bin/sh

# Start Azurite Blob service
azurite-blob --blobHost 0.0.0.0 --blobPort 10000 --loose &
AZURITE_PID=$!

while ! nc -z 0.0.0.0 10000; do
  sleep 1
done

echo "Azurite is up."

az storage container create \
  --name drocsid \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://0.0.0.0:10000/devstoreaccount1" \
  --public-access blob

echo "Container 'drocsid' created."

wait $AZURITE_PID
