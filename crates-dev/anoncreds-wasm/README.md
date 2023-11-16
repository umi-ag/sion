# anoncreds-rs

## Step one: install `wasm-pack`

```console
cargo install wasm-pack
```

## Step two: compile the library

### For usage with bundler

```console
wasm-pack build --no-default-features --features=wasm
```

### For usage with Node.JS

```console
wasm-pack build --target=nodejs --no-default-features --features=wasm
```

The output is located in the `./pkg` directory
