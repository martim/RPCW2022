FROM node:latest

WORKDIR /usr/src/auth-app

#COPY ["package.json", "package-lock.json*", "./"]
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4050

CMD [ "npm", "start" ]