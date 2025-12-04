# 1. Fase de compilacion (Asumimos que ya tienes el JAR en target/)
# Usamos una imagen base de Java 17 para ejecutar
FROM eclipse-temurin:17-jre-alpine

# Expone el puerto por defecto de Spring Boot Actuator/API
EXPOSE 8080

# Define el directorio de trabajo
WORKDIR /app

# Copia el JAR compilado desde tu maquina al contenedor
# Asegúrate de que este Dockerfile esté en la raíz de botica-backend/
COPY target/botica-backend-0.0.1-SNAPSHOT.jar botica-backend.jar

# Comando para ejecutar la aplicacion
ENTRYPOINT ["java", "-jar", "botica-backend.jar"]