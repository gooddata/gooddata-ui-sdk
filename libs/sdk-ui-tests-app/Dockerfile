
# test

# SDK UI Tests App
#
# Expects that `sdk.tgz` is already created (using `npm run pack-build`).
# WORKSPACE_ID is injected at runtime via the entrypoint (pass as env var).

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/nginxinc/nginx-unprivileged:1.31.3@sha256:49c9bef1797e11117a7f490fd00f282e377ac402fec472c72636f90cdbf72e10

# Switch to root to set up directory permissions, then back to nginx
USER root
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chmod=755 ./scripts/docker-entrypoint.sh /docker-entrypoint-wrapper.sh
ADD --chown=nginx:nginx sdk.tgz /usr/share/nginx/html/
RUN chown nginx:nginx /usr/share/nginx/html
USER nginx

ENTRYPOINT ["/docker-entrypoint-wrapper.sh"]
CMD ["nginx", "-g", "daemon off;"]
