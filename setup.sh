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


echo "$DB_USER" | docker secret create db_user -
echo "$DB_PASS" | docker secret create db_password -

echo "Secrets Docker créés."


mkdir -p ./certs/selfsigned\nopenssl req -x509 -nodes -days 365 -newkey rsa:2048 \\n  -keyout ./certs/selfsigned/server.key \\n  -out ./certs/selfsigned/server.crt \\n  -subj "/CN=localhost"\n

openssl rand -hex 32 | docker secret create api_key -

