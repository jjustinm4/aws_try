FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

# LOCAL MACHINE -> AWS EC2
# LOCAL DOCKER IMAGE -> AWS ECR
CMD ["npm", "run", "dev"]
