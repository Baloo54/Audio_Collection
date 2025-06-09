FROM node:18-alpine

# Définit le dossier de travail et change les droits
WORKDIR /app
COPY package*.json ./
RUN npm install --production \
    && adduser -D -h /app appuser \
    && chown -R appuser /app \
    && mkdir -p /tmp/audio_uploads \
    && chown -R appuser /tmp/audio_uploads

COPY . .


# Exécute le serveur en tant que appuser
USER appuser

EXPOSE 5000
CMD ["node", "Serveur.js"]
