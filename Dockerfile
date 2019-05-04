FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

ENV GOOGLE_APPLICATION_CREDENTIALS="./VoiceNote-310291769422.json"

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
