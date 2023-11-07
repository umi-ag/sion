use bbs::HashElem;
use bbs::{prelude::PublicKey, verifier::Verifier, ProofChallenge, SignatureMessage};

use crate::nonce::ProofNonce;
use crate::proof::SignatureProof;
use crate::proof_request::ProofRequest;
use crate::signature::Signature;

pub fn request_proof(
    revealed_indices: &[usize],
    issuer_pk: &PublicKey,
) -> (ProofRequest, ProofNonce) {
    let proof_request = ProofRequest::new(revealed_indices, issuer_pk);
    let nonce = ProofNonce::new();
    (proof_request, nonce)
}

pub fn verify_signature(
    signature: &Signature,
    pk: &bbs::prelude::PublicKey,
    messages: &[&str],
) -> bool {
    let msgs = messages
        .iter()
        .map(|m| SignatureMessage::hash(m.as_bytes()))
        .collect::<Vec<SignatureMessage>>();

    let valid = signature.inner().verify(&msgs, pk).unwrap();
    assert!(valid);

    valid
}

pub fn verify_proof(
    proof: &SignatureProof,
    proof_request: &ProofRequest,
    nonce: &ProofNonce,
    claims: &[&[u8]],
) -> (bool, ProofChallenge) {
    let challenge = Verifier::create_challenge_hash(
        &[proof.inner().clone()],
        &[proof_request.inner().clone()],
        nonce.inner(),
        Some(claims),
    )
    .unwrap();
    let res = proof
        .inner()
        .proof
        .verify(
            &proof_request.inner().verification_key,
            &proof.inner().revealed_messages,
            &challenge,
        )
        .is_ok();
    (res, challenge)
}
