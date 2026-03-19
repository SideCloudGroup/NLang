FROM node:20-alpine AS frontend_builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN mkdir -p /app/frontend/public
RUN npm run build


FROM node:20-alpine AS frontend_runtime

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=frontend_builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend_builder /app/frontend/public /app/frontend/public
COPY --from=frontend_builder /app/frontend/next.config.js /app/frontend/next.config.js


FROM python:3.12-alpine AS backend_runtime

WORKDIR /app/backend
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ /app/backend/


FROM caddy:2.8-alpine

WORKDIR /app

RUN apk add --no-cache python3 nodejs npm

COPY Caddyfile /app/Caddyfile
COPY config.toml /app/config.toml

COPY --from=backend_runtime /usr/local /usr/local
COPY --from=backend_runtime /app/backend /app/backend

COPY --from=frontend_runtime /app/frontend /app/frontend

COPY docker/entrypoint.sh /app/docker/entrypoint.sh
RUN chmod +x /app/docker/entrypoint.sh

ENV NLANG_CONFIG=/app/config.toml
EXPOSE 80

ENTRYPOINT ["/app/docker/entrypoint.sh"]

