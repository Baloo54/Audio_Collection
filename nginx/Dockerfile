FROM nginx:alpine

# Copie de la config NGINX
COPY conf.d/ /etc/nginx/conf.d/

# Entrypoint personnalisé si besoin
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup

# Change l'utilisateur pour exécuter NGINX

USER nginxuser

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
