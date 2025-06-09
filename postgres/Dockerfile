FROM postgres:15-alpine

ENV POSTGRES_DB=mydb

# Créer l'utilisateur, groupe et changer la propriété en une seule couche RUN
RUN addgroup -g 1000 pguser && \
    adduser -u 1000 -G pguser -s /bin/sh -D pguser && \
    chown -R pguser:pguser /var/lib/postgresql/data

COPY init.sql /docker-entrypoint-initdb.d/init.sql

RUN chmod 0444 /docker-entrypoint-initdb.d/init.sql

USER pguser

EXPOSE 5432

CMD ["postgres"]
