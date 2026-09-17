# ── Fase 1: Compilar con Maven ──────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar archivos de proyecto
COPY pom.xml .
COPY src ./src

# Compilar sin tests para acelerar el build
RUN mvn clean package -DskipTests

# ── Fase 2: Imagen final ligera ──────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar el JAR generado
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto dinámico de Railway
EXPOSE 8080

# Iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
