FROM node:latest

WORKDIR /usr/src/api-app

#COPY ["package.json", "package-lock.json*", "./"]
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4040

CMD [ "npm", "start" ]