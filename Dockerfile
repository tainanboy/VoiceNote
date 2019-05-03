FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install express
RUN npm install multer
RUN npm install --save @google-cloud/language

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
