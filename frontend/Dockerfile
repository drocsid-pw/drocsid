FROM node:24-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

ENV ROLLUP_USE_NATIVE=false
ENV HOST=0.0.0.0


FROM base AS build
ARG GOOGLE_OAUTH_CLIENT_ID
ARG VITE_API_BASE_URL
ENV GOOGLE_OAUTH_CLIENT_ID=$GOOGLE_OAUTH_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build


FROM node:24-bookworm-slim AS prod
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/dist ./dist

RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
