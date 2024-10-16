FROM node:18-alpine

WORKDIR /app

COPY server/user/package.json ./

RUN yarn global add nodemon ts-node
RUN yarn

COPY . .

CMD ["yarn", "dev"]