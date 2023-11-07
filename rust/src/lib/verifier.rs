use bbs::{
    prelude::PublicKey, verifier::Verifier, ProofChallenge, ProofNonce, ProofRequest,
    SignatureProof,
};

pub fn request_proof(
    revealed_indices: &[usize],
    issuer_pk: &PublicKey,
) -> (ProofRequest, ProofNonce) {
    let proof_request = Verifier::new_proof_request(revealed_indices, issuer_pk).unwrap();
    let nonce = Verifier::generate_proof_nonce();
    (proof_request, nonce)
}

pub fn verify_proof(
    proof: &SignatureProof,
    proof_request: &ProofRequest,
    nonce: &ProofNonce,
    claims: &[&[u8]],
) -> (bool, ProofChallenge) {
    let challenge = Verifier::create_challenge_hash(
        &[proof.clone()],
        &[proof_request.clone()],
        nonce,
        Some(claims),
    )
    .unwrap();
    let res = proof
        .proof
        .verify(
            &proof_request.verification_key,
            &proof.revealed_messages,
            &challenge,
        )
        .is_ok();
    (res, challenge)
}
