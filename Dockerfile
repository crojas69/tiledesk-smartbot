# Imagen base moderna con soporte TLS actualizado
FROM node:16.17.0-bullseye

# Actualizar lista de repositorios e instalar certificados raíz para conexiones HTTPS/TLS seguras
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Carpeta de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias primero para aprovechar la cache de Docker
COPY package*.json ./

# Instalar solo dependencias necesarias para producción
RUN npm install --production

# Copiar el resto del código fuente
COPY . .

# Exponer puerto de la aplicación
EXPOSE 3000

# Verificar que la app esté viva desde dentro del contenedor
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s \
  CMD curl --fail http://localhost:3000/ || exit 1

# Comando de inicio de la app
CMD ["node", "bin/www"]
