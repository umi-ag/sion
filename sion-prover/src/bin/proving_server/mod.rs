use axum::{routing::post, Router};
use clap::Parser;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

mod generate_proofs;
use generate_proofs::gen_proof_bound_check;

#[derive(Parser)]
#[clap(
    // name = "My Application",
    // author = "Author's name",
    // version = "v1.0.0",
    // about = "Application short description."
)]
struct AppArg {
    #[clap(short, long, default_value_t = 8080)]
    port: u16,
}

#[tokio::main]
async fn main() {
    let arg: AppArg = AppArg::parse();

    let app = Router::new()
        .route("/gen-proof", post(gen_proof_bound_check))
        .layer(
            CorsLayer::new()
                // .allow_methods(vec![http::Method::GET, http::Method::POST])
                // .allow_credentials false
                .allow_origin(Any)
                .allow_headers(Any),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], arg.port));
    // let addr = SocketAddr::from(([127, 0, 0, 1], arg.port));

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
