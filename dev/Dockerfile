# Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Copier la config Docker (optionnel - on peut aussi utiliser variables d'env)
COPY application-docker.properties .

EXPOSE 8080
CMD ["java", "-jar", "app.jar", "--spring.config.location=file:./application-docker.properties"]