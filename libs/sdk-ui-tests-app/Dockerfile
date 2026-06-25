
# test

# SDK UI Tests App
#
# Expects that `sdk.tgz` is already created (using `npm run pack-build`).
# WORKSPACE_ID is injected at runtime via the entrypoint (pass as env var).

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/nginxinc/nginx-unprivileged:1.31.2@sha256:fdf54c2136c873e3df2457d8f00ebcc070e17845233e1cf3220dfcb0a8b93eb4

# Switch to root to set up directory permissions, then back to nginx
USER root
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chmod=755 ./scripts/docker-entrypoint.sh /docker-entrypoint-wrapper.sh
ADD --chown=nginx:nginx sdk.tgz /usr/share/nginx/html/
RUN chown nginx:nginx /usr/share/nginx/html
USER nginx

ENTRYPOINT ["/docker-entrypoint-wrapper.sh"]
CMD ["nginx", "-g", "daemon off;"]
