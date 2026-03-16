# (C) 2025 GoodData Corporation

# SDK UI Tests App
#
# Expects that `sdk.tgz` is already created (using `npm run pack-build`).

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/nginxinc/nginx-unprivileged:1.29.1

ADD --chown=nginx:nginx sdk.tgz /usr/share/nginx/html/
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
