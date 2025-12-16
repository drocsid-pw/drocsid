#!/usr/bin/env python3
"""
Quick upload script - just give me the URL!
"""

from azure.storage.blob import BlobServiceClient, ContentSettings
import os

# Azurite connection
CONNECTION_STRING = (
    "DefaultEndpointsProtocol=http;"
    "AccountName=devstoreaccount1;"
    "AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;"
    "BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
)

def quick_upload(video_path):
    """Upload and open video in browser."""
    if not os.path.exists(video_path):
        print(f"File not found: {video_path}")
        return
    
    blob_name = os.path.basename(video_path)
    
    try:
        # Connect
        blob_service = BlobServiceClient.from_connection_string(CONNECTION_STRING)
        
        # Get/create container
        container = blob_service.get_container_client("drocsid")
        if not container.exists():
            container.create_container(public_access='blob')
        
        # Upload
        blob_client = container.get_blob_client(blob_name)
        with open(video_path, "rb") as f:
            blob_client.upload_blob(
                f,
                overwrite=True,
                content_settings=ContentSettings(
                    content_type="video/mp4",
                    content_disposition="inline"
                )
            )
        
        url = blob_client.url
        
        return url
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure Azurite is running!")

# Usage:
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        quick_upload(sys.argv[1])
    else:
        print("Usage: python quick_upload.py your_video.mp4")