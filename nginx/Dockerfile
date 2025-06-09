FROM nginx:alpine

# Copie de la config NGINX
COPY conf.d/ /etc/nginx/conf.d/

# Copie des fichiers HTML (frontend)
COPY html/ /usr/share/nginx/html/

# Entrypoint personnalisé si besoin
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
