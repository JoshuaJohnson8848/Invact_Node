FROM node:21.7.3-alpine3.20

WORKDIR /app/invact/

COPY package*.json ./

RUN apk add --no-cache npm

RUN npm install

COPY . ./

EXPOSE 7000

CMD [ "npm","run","start","--host", "0.0.0.0" ]