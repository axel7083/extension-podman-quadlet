FROM registry.access.redhat.com/ubi9/nodejs-22 AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

USER root
# Install python for node-gyp
RUN dnf install -y python3 make gcc g++
# Install Corepack (pnpm)
RUN npm i -g corepack@0.31.0 && corepack enable

COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm build

# adding ssh2 to to dist folder
RUN echo "node-linker=hoisted" >> /app/packages/backend/dist/.npmrc
RUN pnpm --dir /app/packages/backend/dist add ssh2@1.16.0

FROM scratch

COPY --from=builder /app/packages/backend/dist/ /extension/dist
COPY --from=builder /app/packages/backend/package.json /extension/
COPY --from=builder /app/packages/backend/quadlet-icon.woff2 /extension/
COPY --from=builder /app/packages/backend/media/ /extension/media
COPY --from=builder /app/LICENSE /extension/
COPY --from=builder /app/packages/backend/icon.png /extension/
COPY --from=builder /app/README.md /extension/

LABEL org.opencontainers.image.title="Podman Quadlet Extension" \
        org.opencontainers.image.description="Podman Quadlet Extension" \
        org.opencontainers.image.vendor="axel7083" \
        io.podman-desktop.api.version=">= 1.14.0"
