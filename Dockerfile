FROM node:12.15.0
COPY . /home/app
WORKDIR /home/app
RUN ./common/scripts/setup-rush.sh
