use serde_json::json;
use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
// pub fn generate_keypair(message_count: usize) -> JsValue {
//     let (pk, sk) = sion::entry::generate_keypair(message_count);

//     JsValue::from_str(
//         &json!({
//             "publicKey": pk,
//             "secretKey": sk
//         })
//         .to_string(),
//     )
// }

// #[wasm_bindgen]
// pub fn generate_signature(messages: Vec<String>, sk_str: &str, pk_str: &str) -> String {
//     sion::entry::generate_signature(
//         &messages.iter().map(AsRef::as_ref).collect::<Vec<&str>>(),
//         sk_str,
//         pk_str,
//     )
// }

// #[wasm_bindgen]
// pub fn request_proof(disclosure_request: Vec<usize>, pk_str: &str) -> JsValue {
//     let (proof_request, proof_nonce) = sion::entry::request_proof(&disclosure_request, pk_str);

//     JsValue::from_str(
//         &json!({
//             "proofRequest": proof_request,
//             "proofNonce": proof_nonce
//         })
//         .to_string(),
//     )
// }

// #[wasm_bindgen]
// pub fn generate_pok(
//     signature_str: &str,
//     proof_request_str: &str,
//     proof_nonce_str: &str,
//     messages: Vec<String>,
//     claims: Vec<String>,
// ) -> JsValue {
//     let (proof, prover_challenge_hash) = sion::entry::generate_pok(
//         signature_str,
//         proof_request_str,
//         proof_nonce_str,
//         &messages.iter().map(AsRef::as_ref).collect::<Vec<&str>>(),
//         &claims.iter().map(AsRef::as_ref).collect::<Vec<&[u8]>>(),
//     );

//     JsValue::from_str(
//         &json!({
//             "proof": proof,
//             "proverChallengeHash": prover_challenge_hash
//         })
//         .to_string(),
//     )
// }

#[wasm_bindgen]
pub fn verify_signature(signature_str: &str, pk_str: &str, messages: Vec<String>) -> bool {
    let msgs = messages.iter().map(AsRef::as_ref).collect::<Vec<&str>>();
    sion::entry::verify_signature(signature_str, pk_str, &msgs)
}

#[wasm_bindgen]
pub fn verify_proof(
    proof_str: &str,
    proof_request_str: &str,
    nonce_str: &str,
    challenge_hash: &str,
) -> bool {
    sion::entry::verify_proof(proof_str, proof_request_str, nonce_str, challenge_hash, &[])
}
