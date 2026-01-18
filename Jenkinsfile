pipeline {
    agent none

    environment {
        PATH = "/usr/bin:/usr/local/bin:$PATH"
    }

    stages {
        stage('Checkout') {
            agent any
            steps {
                checkout scm
            }
        }

        stage('Build and Test Services') {
            parallel {
                stage('Frontend') {
                    agent {
                        docker { 
                            image 'node:24-bookworm-slim' 
                            args '-u root:root' 
                        }
                    }
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }

                stage('Backend') {
                    agent {
                        docker { 
                            image 'maven:3.9-eclipse-temurin-17' 
                            args '-v /root/.m2:/root/.m2' 
                        }
                    }
                    steps {
                        dir('spring_grpc') {
                            sh 'mvn clean install -DskipTests'
                            sh 'mvn test' 
                        }
                    }
                }

                stage('Core') {
                    agent any
                    steps {
                        dir('drocsid_core') {
                            sh 'docker build -t drocsid-core .'
                        }
                    }
                }

                stage('Mediaproxy') {
                    agent any 
                    steps {
                        script {
                            sh 'docker build -t mediaproxy ./mediaproxy'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
        }
    }
}
