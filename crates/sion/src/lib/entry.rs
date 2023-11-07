use std::str::FromStr;

pub fn verify_proof(
    proof_str: &str,
    proof_request_str: &str,
    nonce_str: &str,
    challenge_hash: &str,
    claims: &[&[u8]],
) -> bool {
    let proof = crate::proof::SignatureProof::from_str(proof_str).unwrap();
    let proof_request = crate::proof_request::ProofRequest::from_str(proof_request_str).unwrap();
    let nonce = crate::nonce::ProofNonce::from_str(nonce_str).unwrap();

    let (valid, verifier_challenge_hash) =
        crate::verifier::verify_proof(&proof, &proof_request, &nonce, claims);

    dbg!(
        valid,
        &verifier_challenge_hash,
        &challenge_hash,
        verifier_challenge_hash.to_string() == challenge_hash.to_string()
    );
    valid && (challenge_hash == verifier_challenge_hash.to_string())
    // valid
}
