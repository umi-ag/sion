use std::str::FromStr;

pub fn generate_keypair(message_count: usize) -> (String, String) {
    let keypair = crate::keys::KeyPair::new(message_count);
    (keypair.pk().to_string(), keypair.sk().to_string())
}

pub fn generate_signature(messages: &[&str], sk_str: &str, pk_str: &str) -> String {
    let sk = crate::keys::SecretKey::from_str(sk_str).unwrap();
    let pk = crate::keys::PublicKey::from_str(pk_str).unwrap();
    let signature = crate::issuer::generate_signature(messages, &sk, &pk);
    signature.to_string()
}

pub fn generate_proof(
    signature_str: &str,
    proof_request_str: &str,
    nonce_str: &str,
    messages: &[&str],
    claims: &[&[u8]],
) -> (String, String) {
    let signature = crate::signature::Signature::from_str(signature_str).unwrap();
    let proof_request = crate::proof_request::ProofRequest::from_str(proof_request_str).unwrap();

    let (proof, challenge) = crate::prover::generate_pok(
        &signature,
        &proof_request,
        &crate::nonce::ProofNonce::from_str(nonce_str).unwrap(),
        messages,
        claims,
    );

    (proof.to_string(), challenge.to_string())
}

pub fn verify_signature(signature_str: &str, pk_str: &str, messages: &[&str]) -> bool {
    let signature = crate::signature::Signature::from_str(signature_str).unwrap();
    let pk = crate::keys::PublicKey::from_str(pk_str).unwrap();
    let valid = crate::verifier::verify_signature(&signature, &pk, messages);
    valid
}

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
