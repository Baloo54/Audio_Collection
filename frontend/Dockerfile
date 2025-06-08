FROM nginx:alpine

COPY ./nginx/conf.d /etc/nginx/conf.d
COPY ./certs /etc/nginx/certs
COPY ./frontend/dist /usr/share/nginx/html
