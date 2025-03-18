# (C) 2021 GoodData Corporation

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/docker.io/library/node:22.13.0-bullseye as build-stage

COPY . .

ENV FORCE_COLOR 0

RUN npm run build-scenarios

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/3rdparty/nginxinc/nginx-unprivileged:1.25.2-alpine

COPY --from=build-stage ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage ./scenarios/build /usr/share/nginx/html/gooddata-ui-sdk/

ARG GIT_COMMIT=unspecified
LABEL image_name="Gooddata ui sdk Scenarios"
LABEL maintainer="RAIL <rail@gooddata.com>"
LABEL git_repository_url="https://github.com/gooddata/gooddata-ui-sdk"
LABEL parent_image="020413372491.dkr.ecr.us-east-1.amazonaws.com/3rdparty/nginxinc/nginx-unprivileged:1.23.1-alpine"
LABEL git_commit=$GIT_COMMIT
