
run-ui:
    bun i
    bun run build
    cd ui && bun dev

install-sui-client-gen:
    cargo install --locked --git https://github.com/kunalabs-io/sui-client-gen.git --tag v0.2.0
