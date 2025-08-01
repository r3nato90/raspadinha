FROM node:22.13.0-alpine

WORKDIR /app/raspadinha-api

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma migrate deploy
RUN npx prisma generate

RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start"]