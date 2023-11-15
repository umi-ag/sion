#[derive(Debug)]
struct VerifierTuple {
    proof: String,
    request: String,
    nonce: String,
    challenge: String,
}

fn main() {
    let (pk, sk) = sion::entry::generate_keypair(4);
    let messages = vec![
        "message_1",
        "message_2",
        "message_3",
        "message_4",
        "message_5",
    ];
    let signature = sion::entry::generate_signature(&messages, &sk, &pk);

    // Verifier requests a proof
    let disclosure_request = [1, 3];
    let (proof_request, proof_nonce) = sion::entry::request_proof(&disclosure_request, &pk);
    let claims = vec![
        // "self-attested claim1".as_bytes(),
        // "self-attested claim2".as_bytes(),
    ];

    // Prover generates a proof
    let (proof, prover_challenge_hash) =
        sion::entry::generate_pok(&signature, &proof_request, &proof_nonce, &messages, &claims);

    // Verifier verifies the proof
    let res = sion::entry::verify_proof(
        &proof,
        &proof_request,
        &proof_nonce,
        &prover_challenge_hash,
        &claims,
    );
    dbg!(res);
}
