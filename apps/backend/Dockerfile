# Stage 1: Build the Spring Boot application using Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace

# Copy Maven wrapper and pom.xml first to optimize layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build executable jar
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal, secure JRE 21 runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Non-root user for container security
RUN groupadd -r tutorzen && useradd -r -g tutorzen tutorzen
USER tutorzen:tutorzen

COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

