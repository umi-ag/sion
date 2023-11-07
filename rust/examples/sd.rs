fn main() {
    // Issuer generates a signature
    let issuer = sion::issuer::IssuerModule::new(5);
    let messages = vec![
        "message_1",
        "message_2",
        "message_3",
        "message_4",
        "message_5",
    ];
    let signature = issuer.generate_signature(&messages);

    // Verifier requests a proof
    let disclosure_request = [1, 3];
    let (proof_request, proof_nonce) =
        sion::verifier::request_proof(&disclosure_request, issuer.pk());
    let claims = vec![
        "self-attested claim1".as_bytes(),
        "self-attested claim2".as_bytes(),
    ];

    // Prover generates a proof
    let (proof, prover_challenge_hash) =
        sion::prover::generate_pok(&signature, &proof_request, &proof_nonce, &messages, &claims);

    // Verifier verifies the proof
    let (res, verifier_challenge_hash) =
        sion::verifier::verify_proof(&proof, &proof_request, &proof_nonce, &claims);
    assert_eq!(prover_challenge_hash, verifier_challenge_hash);
    dbg!(res);
}
