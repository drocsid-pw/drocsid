
docker compose up -d

# Get initial admin password
docker exec drocsid-jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Install Docker in Jenkins container
docker exec -u root drocsid-jenkins apt-get update
docker exec -u root drocsid-jenkins apt-get install -y docker.io
docker exec -u root drocsid-jenkins usermod -aG docker jenkins
docker restart drocsid-jenkins

# View Jenkins logs
docker logs -f drocsid-jenkins

# Restart Jenkins
docker restart drocsid-jenkins

# Stop Jenkins
docker compose stop

# Access Jenkins UI
# http://localhost:8081
