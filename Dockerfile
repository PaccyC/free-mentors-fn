FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_GRAPHQL_URL=http://localhost:8000/graphql
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL

RUN pnpm build

FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
