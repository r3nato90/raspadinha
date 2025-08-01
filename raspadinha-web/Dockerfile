FROM node:22.13.0-alpine

WORKDIR /app/raspadinha-web

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]