FROM node:9.11

WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm install -g eslint
COPY . /app
EXPOSE 8080
