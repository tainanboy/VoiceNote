FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

#RUN export GOOGLE_APPLICATION_CREDENTIALS="./VoiceNote-310291769422.json"

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
