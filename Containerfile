FROM ghcr.io/redhat-developer/podman-desktop-rhel-ext-builder:next AS builder

COPY . /opt/app-root/
WORKDIR /opt/app-root/

RUN pnpm install --frozen-lockfile
RUN pnpm build

# adding ssh2 to to dist folder
RUN echo "node-linker=hoisted" >> /opt/app-root/packages/backend/dist/.npmrc
RUN pnpm --dir /opt/app-root/packages/backend/dist add ssh2@1.16.0

FROM scratch

COPY --from=builder /opt/app-root/packages/backend/dist/ /extension/dist
COPY --from=builder /opt/app-root/packages/backend/package.json /extension/
COPY --from=builder /opt/app-root/packages/backend/quadlet-icon.woff2 /extension/
COPY --from=builder /opt/app-root/packages/backend/media/ /extension/media
COPY --from=builder /opt/app-root/LICENSE /extension/
COPY --from=builder /opt/app-root/packages/backend/icon.png /extension/
COPY --from=builder /opt/app-root/README.md /extension/

LABEL org.opencontainers.image.title="Podman Quadlet Extension" \
        org.opencontainers.image.description="Podman Quadlet Extension" \
        org.opencontainers.image.vendor="axel7083" \
        io.podman-desktop.api.version=">= 1.14.0"
