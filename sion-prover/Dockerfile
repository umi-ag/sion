# syntax = docker/dockerfile:1.4

FROM rust:bookworm as builder

WORKDIR /app

COPY . .
RUN --mount=type=cache,target=/app/target \
  set -eux; \
  cargo build --bin proving_server --release; \
  objcopy --compress-debug-sections target/release/proving_server ./server

FROM debian:bookworm-slim

RUN set -eux; \
  export DEBIAN_FRONTEND=noninteractive; \
  apt update; \
  apt install --yes --no-install-recommends bind9-dnsutils iputils-ping iproute2 curl ca-certificates htop; \
  apt clean autoclean; \
  apt autoremove --yes; \
  rm -rf /var/lib/{apt,dpkg,cache,log}/; \
  echo "Installed base utils!"

WORKDIR /app

COPY --from=builder /app/server ./server

RUN chmod +x ./server

CMD ["./server", "--port", "8080"]
