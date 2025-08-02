FROM node:18-bullseye

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s CMD curl --fail http://localhost:3000/ || exit 1

CMD ["node", "bin/www"]
