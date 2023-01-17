FROM node:carbon

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src /app/src
COPY index.js /app/index.js

EXPOSE 8080
CMD [ "node", "index.js" ]