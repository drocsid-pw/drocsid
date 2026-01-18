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
                    agent {
                        docker { 
                            image 'elixir:1.17' 
                        }
                    }
                    steps {
                        dir('drocsid_core') {
                            sh 'mix local.hex --force'
                            sh 'mix local.rebar --force'
                            sh 'mix deps.get'
                            sh 'mix test'
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
