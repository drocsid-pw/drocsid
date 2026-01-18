FROM jenkins/jenkins:lts-jdk21

USER root

# Install Maven
RUN apt-get update && \
    apt-get install -y maven docker.io && \
    apt-get clean

USER jenkins
