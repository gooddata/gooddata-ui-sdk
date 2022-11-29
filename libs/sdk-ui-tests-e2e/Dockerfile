# (C) 2021 GoodData Corporation

FROM node:16.13.2-alpine as build-stage

COPY . .

ENV FORCE_COLOR 0

RUN yarn install && yarn build-scenarios

FROM nginxinc/nginx-unprivileged:1.23.1-alpine

COPY --from=build-stage ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage ./scenarios/build /usr/share/nginx/html/gooddata-ui-sdk/

ARG GIT_COMMIT=unspecified
LABEL image_name="Gooddata ui sdk Scenarios"
LABEL maintainer="RAIL <rail@gooddata.com>"
LABEL git_repository_url="https://github.com/gooddata/gooddata-ui-sdk"
LABEL parent_image="nginxinc/nginx-unprivileged:1.23.1-alpine"
LABEL git_commit=$GIT_COMMIT
