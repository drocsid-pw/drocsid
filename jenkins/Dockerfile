FROM jenkins/jenkins:lts-jdk21

USER root

RUN apt-get update && \
    apt-get install -y maven docker.io && \
    apt-get clean && \
    git config --global --add safe.directory '*'

USER jenkins
RUN jenkins-plugin-cli --plugins docker-workflow
