pipeline {
    agent any

    // tools { maven 'maven' } 
    // Assuming Maven is installed in the agent and available on PATH
    environment {
        PATH = "/usr/bin:$PATH" // Ensure standard bin is in path, though usually it is.
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean install -DskipTests'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
    }

    post {
        always {
            junit '**/target/surefire-reports/*.xml'
        }
    }
}
