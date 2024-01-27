FROM node:20.11.0-alpine
MAINTAINER ilya <sizov.ilya1996@gmail.com>
RUN apk update
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .