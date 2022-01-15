FROM node:14-alpine As development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD npm run start:dev
