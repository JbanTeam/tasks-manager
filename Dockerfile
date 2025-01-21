FROM node:20.18.1-alpine as development

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

RUN chmod +x /usr/src/app/entrypoint.sh
RUN npm run prisma:gen
RUN npm run build

FROM node:20.18.1-alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci --only=production

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/entrypoint.sh ./

RUN npm run prisma:gen

ENTRYPOINT ["/bin/sh", "-c", "/usr/src/app/entrypoint.sh"]