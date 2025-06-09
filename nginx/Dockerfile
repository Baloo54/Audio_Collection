FROM nginx:alpine

# Copie la config nginx
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# expose les ports
EXPOSE 80 443

# Copie l'éventuel script de démarrage
COPY entrypoint.sh /entrypoint.sh

# Crée un utilisateur non-root et rend l'entrée exécutable
RUN chmod +x /entrypoint.sh \
    && addgroup -g 1001 -S nginxgroup \
    && adduser -u 1001 -S nginxuser -G nginxgroup \
    && chown -R nginxuser:nginxgroup /etc/nginx /entrypoint.sh /var/cache/nginx /var/run /var/log/nginx \
    && mkdir -p /run && chown nginxuser:nginxgroup /run

# Utilise un utilisateur non-root
USER nginxuser

# Définition du point d'entrée et commande de lancement
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
