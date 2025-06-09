# Utilise une image Node.js légère
FROM node:18-alpine

# Définit le dossier de travail à l'intérieur du container
WORKDIR /app

# Copie les fichiers package.json et package-lock.json du backend
COPY package*.json ./

# Installe uniquement les dépendances de production
RUN npm install --production \
    && RUN useradd -m appuser

# Copie tout le code du backend dans le container
COPY ./ .

# Change l'utilisateur pour exécuter le serveur
USER appuser

# Expose le port utilisé par ton serveur Node.js
EXPOSE 5000

# Démarre le serveur
CMD ["node", "Serveur.js"]
