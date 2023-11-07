use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

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
