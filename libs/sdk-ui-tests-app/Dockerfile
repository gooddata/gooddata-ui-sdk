# (C) 2025 GoodData Corporation

# SDK UI Tests App
#
# Expects that `sdk.tgz` is already created (using `npm run pack-build`).
# WORKSPACE_ID is injected at runtime via the entrypoint (pass as env var).

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/nginxinc/nginx-unprivileged:1.29.1

# Switch to root to set up directory permissions, then back to nginx
USER root
ADD --chown=nginx:nginx sdk.tgz /usr/share/nginx/html/
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chmod=755 ./scripts/docker-entrypoint.sh /docker-entrypoint-wrapper.sh
RUN chown nginx:nginx /usr/share/nginx/html
USER nginx

ENTRYPOINT ["/docker-entrypoint-wrapper.sh"]
CMD ["nginx", "-g", "daemon off;"]
