FROM node:18-alpine

# Crée un utilisateur non-root sans dépendances inutiles
RUN adduser -D -h /app appuser

# Définit le dossier de travail et change les droits
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Donne la propriété à l'utilisateur appuser
RUN chown -R appuser /app

# Exécute le serveur en tant que appuser
USER appuser

EXPOSE 5000
CMD ["node", "Serveur.js"]
