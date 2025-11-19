FROM maven:3.9.2-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -e -ntp package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/spring_grpc-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]