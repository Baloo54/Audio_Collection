#!/bin/bash

set -e

echo "Création des secrets Docker pour PostgreSQL"

read -p "Nom d'utilisateur DB : " DB_USER
read -sp "Mot de passe DB : " DB_PASS
echo

docker secret rm db_user 2>/dev/null || true
docker secret rm db_password 2>/dev/null || true

docker swarm init 2>/dev/null || true
docker network create --driver overlay --opt encrypted my_encrypted_network

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout certs/nginx/server.key -out certs/nginx/server.crt \
-subj "/CN=localhost"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout certs/postgres/server.key -out certs/postgres/server.crt \
-subj "/CN=postgres"

chown 70:70 certs/postgres/server.key
chmod 640 certs/postgres/server.key


echo "$DB_USER" | docker secret create db_user -
echo "$DB_PASS" | docker secret create db_password -

echo "Secrets Docker créés."
