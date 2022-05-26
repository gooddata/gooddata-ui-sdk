# (C) 2022 GoodData Corporation

FROM harbor.intgdc.com/tools/gdc-frontend-node-16:node-16.13.0-yarn-1.22.17 as build-stage

COPY . .

ENV FORCE_COLOR 0

FROM harbor.intgdc.com/3rdparty/nginxinc/nginx-unprivileged:1.21.6-alpine

COPY --from=build-stage dist-storybook /usr/share/nginx/html/
COPY --from=build-stage nginx/nginx.conf /etc/nginx/nginx.conf

ARG GIT_COMMIT=unspecified
LABEL image_name="GoodData UI SDK StoryBook"
LABEL maintainer="RAIL <rail@gooddata.com>"
LABEL git_repository_url="https://github.com/gooddata/gooddata-ui-sdk"
LABEL parent_image="harbor.intgdc.com/3rdparty/nginxinc/nginx-unprivileged:1.21.6-alpine"
LABEL git_commit=$GIT_COMMIT
