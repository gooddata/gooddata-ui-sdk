# (C) 2021 GoodData Corporation

FROM harbor.intgdc.com/tools/gdc-frontend-node:node-12.16.1-yarn-1.22.4 as build-stage

ARG NPM_TOKEN

WORKDIR /build

COPY . .

ENV FORCE_COLOR 0

RUN npm config set '//registry.npmjs.org/:_authToken' $NPM_TOKEN \
    && yarn install --frozen-lockfile \
    && yarn dist

FROM harbor.intgdc.com/3rdparty/nginxinc/nginx-unprivileged:1.17.2-alpine

COPY --from=build-stage /build/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /build/dist /usr/share/nginx/html/dashboards/
#COPY --from=build-stage /build/app/assets/logo.png /usr/share/nginx/html/images/header/logo.png

ARG GIT_COMMIT=unspecified
LABEL image_name="KPI dashboards app"
LABEL maintainer="BabyBears <babybears@gooddata.com>"
LABEL git_repository_url="https://github.com/gooddata/gdc-dashboards"
LABEL parent_image="harbor.intgdc.com/3rdparty/nginxinc/nginx-unprivileged:1.17.2-alpine"
LABEL git_commit=$GIT_COMMIT
