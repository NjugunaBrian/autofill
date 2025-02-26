FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

#Build the app
RUN npm run build

#install serve to run the application
RUN npm install -g serve

EXPOSE 5173

CMD ["npm", "run", "dev"]