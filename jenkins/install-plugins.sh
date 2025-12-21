#!/bin/bash

echo "Installing Jenkins plugins..."

docker exec drocsid-jenkins wget -q http://localhost:8080/jnlpJars/jenkins-cli.jar -O /tmp/jenkins-cli.jar

echo "Waiting for Jenkins to be ready..."
sleep 10

docker exec drocsid-jenkins java -jar /tmp/jenkins-cli.jar -s http://localhost:8080/ -auth admin:admin install-plugin \
    git \
    github \
    github-branch-source \
    pipeline-stage-view \
    docker-workflow \
    docker-plugin \
    nodejs \
    maven-plugin \
    junit \
    workflow-aggregator \
    credentials-binding \
    ssh-agent \
    timestamper \
    ws-cleanup \
    email-ext \
    slack \
    -restart

echo "Plugins installed. Jenkins will restart automatically."
echo "Wait about 30 seconds for Jenkins to restart, then access it at http://localhost:8081"
