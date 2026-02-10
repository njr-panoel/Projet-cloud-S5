# Build
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
RUN mvn dependency:go-offline -B || true

COPY src ./src
RUN mvn clean package -DskipTests

# Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
COPY application-docker.properties .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.config.location=file:./application-docker.properties"]




