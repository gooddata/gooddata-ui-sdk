# (C) 2021 GoodData Corporation

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-node-16:node-16.13.0-yarn-1.22.17 as build-stage

COPY . .

ENV FORCE_COLOR 0

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/3rdparty/nginxinc/nginx-unprivileged:1.23.1-alpine

COPY --from=build-stage ./libs/sdk-ui-tests-e2e/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage ./libs/sdk-ui-tests-e2e/scenarios/build /usr/share/nginx/html/gooddata-ui-sdk/

ARG GIT_COMMIT=unspecified
LABEL image_name="Gooddata ui sdk Scenarios"
LABEL maintainer="RAIL <rail@gooddata.com>"
LABEL git_repository_url="https://github.com/gooddata/gooddata-ui-sdk"
LABEL parent_image="020413372491.dkr.ecr.us-east-1.amazonaws.com/3rdparty/nginxinc/nginx-unprivileged:1.23.1-alpine"
LABEL git_commit=$GIT_COMMIT
