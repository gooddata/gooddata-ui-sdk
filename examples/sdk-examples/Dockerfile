FROM nginx:1.19-alpine

COPY ./docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY ./dist/ /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
