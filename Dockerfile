FROM node:latest
WORKDIR /app
COPY . /app

RUN npm install
RUN npm install --prefix public/