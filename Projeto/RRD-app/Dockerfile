FROM node:latest

WORKDIR /usr/src/app

#COPY ["package.json", "package-lock.json*", "./"]
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4030

CMD [ "npm", "start" ]