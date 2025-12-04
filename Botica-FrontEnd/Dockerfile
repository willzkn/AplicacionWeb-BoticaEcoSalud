# 1. Fase de compilacion (Build) con Node 18
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
# Instala dependencias
RUN npm install
# Copia el codigo y compila
COPY . .
RUN npm run build

# 2. Fase de ejecucion (Servir con Nginx para eficiencia)
FROM nginx:alpine
# Copia los archivos de construccion (build) de React a la carpeta de Nginx
COPY --from=builder /app/build /usr/share/nginx/html
# Puerto por defecto de Nginx
EXPOSE 80