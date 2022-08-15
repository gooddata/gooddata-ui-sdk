# (C) 2020 GoodData Corporation
# TODO - dockerfile can be adapted to be used in both current product and NAS
# Create final image with nginx serving built files; the nginx-unprivileged variant is used
# as we must not run images in the context of the superuser. This image comes with user 'nginx' with UID 101 and
# runs as that user by default. The UID of this user is also used in runAsUser directive in the deployment chart.
# !!! Do not change base image to Alpine flavors due to compliance reasons !!!
FROM nginxinc/nginx-unprivileged:1.21.6
#COPY readme.txt / # TODO - There are some auto-generated license files in the bundle, do we need to add extra onces?
ADD web-components.tar.gz /usr/share/nginx/html/components/
COPY nginx.conf /etc/nginx/nginx.conf
