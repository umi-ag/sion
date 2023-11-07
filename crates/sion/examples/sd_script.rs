use bbs::prover::Prover;
use bbs::signature::Signature;
use bbs::verifier::Verifier;

use bbs::prelude::HiddenMessage;
use bbs::prelude::Issuer;
use bbs::prelude::ProofMessage;
use bbs::HashElem;
use bbs::SignatureMessage;
use bbs::{pm_hidden, pm_revealed};

fn main() {
    //issue credential
    let (pk, sk) = Issuer::new_keys(5).unwrap();
    let messages = vec![
        SignatureMessage::hash(b"message_1"),
        SignatureMessage::hash(b"message_2"),
        SignatureMessage::hash(b"message_3"),
        SignatureMessage::hash(b"message_4"),
        SignatureMessage::hash(b"message_5"),
    ];

    let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();

    //verifier requests credential
    let nonce = Verifier::generate_proof_nonce();
    let proof_request = Verifier::new_proof_request(&[1, 3], &pk).unwrap();

    // Sends `proof_request` and `nonce` to the prover
    let proof_messages = vec![
        pm_hidden!(b"message_1"),
        pm_revealed!(b"message_2"),
        pm_hidden!(b"message_3"),
        pm_revealed!(b"message_4"),
        pm_hidden!(b"message_5"),
    ];

    // prover creates pok for proof request
    let pok = Prover::commit_signature_pok(&proof_request, proof_messages.as_slice(), &signature)
        .unwrap();

    let claims = vec![
        "self-attested claim1".as_bytes(),
        "self-attested claim2".as_bytes(),
    ];

    // complete other zkps as desired and compute `challenge_hash`
    let challenge =
        Prover::create_challenge_hash(&[pok.clone()], Some(claims.as_slice()), &nonce).unwrap();

    let proof = Prover::generate_signature_pok(pok, &challenge).unwrap();

    // Send `proof`, `claims`, and `challenge` to Verifier

    // Verifier creates their own challenge bytes using proof, proof_request, claims, and nonce
    let ver_challenge = Verifier::create_challenge_hash(
        &[proof.clone()],
        &[proof_request.clone()],
        &nonce,
        Some(claims.as_slice()),
    )
    .unwrap();

    assert_eq!(challenge, ver_challenge);

    // Verifier checks proof1
    let res = proof.proof.verify(
        &proof_request.verification_key,
        &proof.revealed_messages,
        &ver_challenge,
    );

    dbg!(&res);
}
