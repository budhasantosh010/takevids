FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       ffmpeg \
       git \
       python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
USER node
ENTRYPOINT []
CMD ["node", "--version"]
