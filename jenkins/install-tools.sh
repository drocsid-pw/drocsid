#!/bin/bash

echo "=== Installing build tools in Jenkins container ==="

echo "Updating package list..."
docker exec -u root drocsid-jenkins apt-get update

echo "Installing Maven..."
docker exec -u root drocsid-jenkins apt-get install -y maven

echo "Installing Node.js and npm..."
docker exec -u root drocsid-jenkins curl -fsSL https://deb.nodesource.com/setup_20.x | docker exec -u root -i drocsid-jenkins bash -
docker exec -u root drocsid-jenkins apt-get install -y nodejs

# Verify installations
echo ""
echo "=== Verifying installations ==="
echo "Java version:"
docker exec drocsid-jenkins java -version

echo ""
echo "Maven version:"
docker exec drocsid-jenkins mvn -version

echo ""
echo "Node.js version:"
docker exec drocsid-jenkins node --version

echo ""
echo "npm version:"
docker exec drocsid-jenkins npm --version

echo ""
echo "Docker CLI version:"
docker exec drocsid-jenkins docker --version

echo ""
echo "=== Installation complete! ==="
echo "All tools are ready for the Jenkins pipeline."
