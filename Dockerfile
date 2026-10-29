FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/passenger/package.json ./apps/passenger/package.json
COPY apps/driver/package.json ./apps/driver/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/validation/package.json ./packages/validation/package.json

RUN npm install

COPY . .

RUN npx prisma generate --schema apps/api/prisma/schema.prisma

EXPOSE 3000 3001

CMD ["npm", "run", "start:dev", "--workspace=api"]
