#!/bin/bash

set -e

echo "Création des secrets Docker pour PostgreSQL"

read -p "Nom d'utilisateur DB : " DB_USER
read -sp "Mot de passe DB : " DB_PASS
echo

docker secret rm db_user 2>/dev/null || true
docker secret rm db_password 2>/dev/null || true

docker swarm init 2>/dev/null || true

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout nginx/certs/server.key -out nginx/certs/server.crt \
-subj "/CN=localhost"

echo "$DB_USER" | docker secret create db_user -
echo "$DB_PASS" | docker secret create db_password -

echo "Secrets Docker créés."
