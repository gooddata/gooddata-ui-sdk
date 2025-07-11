# (C) 2023 GoodData Corporation
# TODO - dockerfile can be adapted to be used in both current product and NAS
# Create final image with nginx serving built files; the nginx-unprivileged variant is used
# as we must not run images in the context of the superuser. This image comes with user 'nginx' with UID 101 and
# runs as that user by default. The UID of this user is also used in runAsUser directive in the deployment chart.
# !!! Do not change base image to Alpine flavors due to compliance reasons !!!
FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/nginxinc/nginx-unprivileged:1.29.0

# BEGIN OF Mastercard security compliance - do not alter or remove
USER 0
RUN /usr/bin/rm -rf /etc/crontab /etc/cron.d /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly ; \
    /usr/bin/sed -i '/^CREATE_HOME/ s/^CREATE_HOME.*/CREATE_HOME yes/; t; $ aCREATE_HOME yes' /etc/login.defs ; \
    /usr/bin/sed -i -e 's:/usr/sbin/nologin$:/sbin/nologin:' /etc/passwd
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
USER 101
# END OF Mastercard security compliance

#COPY readme.txt / # TODO - There are some auto-generated license files in the bundle, do we need to add extra onces?
ADD web-components.tar.gz /usr/share/nginx/html/components/
COPY nginx.conf /etc/nginx/nginx.conf
