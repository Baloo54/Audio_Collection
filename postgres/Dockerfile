FROM postgres:15-alpine

# Crée un user non-root si besoin (facultatif si 999 existe déjà dans ton système)
RUN addgroup -g 999 mygroup && adduser -D -u 999 -G mygroup myuser

# Change les droits du dossier de données
RUN chown -R 999:999 /var/lib/postgresql /docker-entrypoint-initdb.d
# Définit l'utilisateur non-root pour les prochaines instructions
USER myuser