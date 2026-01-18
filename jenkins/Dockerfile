FROM jenkins/jenkins:lts-jdk21

USER root

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean

USER jenkins
