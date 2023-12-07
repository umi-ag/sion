use ark_bn254::{Bn254 as Curve, Fr};
use ark_circuits::{
    bound_check::{CircuitBoundCheck, ProofRequestBoundCheck},
    serde_utils::Groth16Verifier,
};
use ark_groth16::Groth16;
use ark_snark::SNARK;
use axum::response::Json;
use num_bigint::BigInt;
use num_traits::Num;
use rand::thread_rng;
use serde::Deserialize;
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};
use std::{collections::HashMap, net::SocketAddr};
use tower_http::cors::{Any, CorsLayer};

pub async fn gen_proof_bound_check(
    body: axum::extract::Json<ProofRequestBoundCheck>,
) -> impl axum::response::IntoResponse {
    let mut rng = thread_rng();

    let circuit = CircuitBoundCheck::<Fr>::from(body.0);
    let public_inputs = circuit.get_public_inputs();
    let pk = Groth16::<Curve>::generate_random_parameters_with_reduction(circuit.clone(), &mut rng)
        .unwrap();
    let proof = Groth16::<Curve>::prove(&pk, circuit.clone(), &mut rng).unwrap();

    let tuple = Groth16Verifier::new(
        &ark_circuits::serde_utils::to_bytes(&pk.vk),
        &ark_circuits::serde_utils::to_bytes(&public_inputs),
        &ark_circuits::serde_utils::to_bytes(&proof),
    );

    Json(tuple)
}
