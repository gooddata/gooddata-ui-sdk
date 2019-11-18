FROM node:10.15.0
COPY . /home/app
WORKDIR /home/app
RUN ./common/scripts/setup-rush.sh
