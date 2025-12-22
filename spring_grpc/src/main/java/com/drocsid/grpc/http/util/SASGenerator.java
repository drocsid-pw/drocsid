package com.drocsid.grpc.http.util;

import com.azure.storage.blob.sas.*;

import java.time.OffsetDateTime;

import com.azure.storage.common.StorageSharedKeyCredential;

public class SASGenerator {

    public static String generateContainerSas(
            String accountName,
            String containerName,
            String accountKey
    ) {
         // Credentials
        StorageSharedKeyCredential credential = new StorageSharedKeyCredential(accountName, accountKey);

        BlobContainerSasPermission permissions = BlobContainerSasPermission.parse("rwc");

        OffsetDateTime expiry = OffsetDateTime.now().plusHours(1);

        BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(expiry, permissions)
                .setContainerName(containerName);

        return sasValues.generateSasQueryParameters(credential).encode();
    }
}