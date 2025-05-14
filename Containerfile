#
# Copyright (C) 2025 Red Hat, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0

FROM registry.access.redhat.com/ubi9/nodejs-22 as builder

User root

ENV PNPM_HOME="/opt/app-root/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@0.31.0 && corepack enable

COPY . /opt/app-root/
WORKDIR /opt/app-root/
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM scratch

COPY --from=builder /opt/app-root/packages/backend/dist/ /extension/dist
COPY --from=builder /opt/app-root/packages/backend/package.json /extension/
COPY --from=builder /opt/app-root/packages/backend/quadlet-icon.woff2 /extension/
COPY --from=builder /opt/app-root/packages/backend/media/ /extension/media
COPY --from=builder /opt/app-root/LICENSE /extension/
COPY --from=builder /opt/app-root/packages/backend/icon.png /extension/
COPY --from=builder /opt/app-root/README.md /extension/
# ssh2 package need to be copied
COPY --from=builder /opt/app-root/node_modules/ssh2 /extension/dist/node_modules/ssh2
# ssh2 depends on asn1
COPY --from=builder /opt/app-root/node_modules/asn1 /extension/dist/node_modules/asn1
# asn1 depends on safer-buffer
COPY --from=builder /opt/app-root/node_modules/safer-buffer /extension/dist/node_modules/safer-buffer
# ssh2 depends on bcrypt-pbkdf
COPY --from=builder /opt/app-root/node_modules/bcrypt-pbkdf /extension/dist/node_modules/bcrypt-pbkdf
# bcrypt-pbkdf depends on tweetnacl
COPY --from=builder /opt/app-root/node_modules/tweetnacl /extension/dist/node_modules/tweetnacl

LABEL org.opencontainers.image.title="Podman Quadlet Extension" \
        org.opencontainers.image.description="Podman Quadlet Extension" \
        org.opencontainers.image.vendor="axel7083" \
        io.podman-desktop.api.version=">= 1.14.0"
