use bbs::prelude::HiddenMessage;
use bbs::prelude::ProofMessage;
use bbs::ProofChallenge;
use bbs::ProofNonce;
use bbs::ProofRequest;
use bbs::SignatureProof;
use bbs::ToVariableLengthBytes;
use bbs::{
    pm_hidden, pm_revealed, prelude::Issuer, prover::Prover, signature::Signature,
    verifier::Verifier, HashElem, SignatureMessage,
};

fn generate_proof() -> (SignatureProof, ProofRequest, ProofNonce) {
    let (pk, sk) = Issuer::new_keys(5).unwrap();
    let messages = vec![
        SignatureMessage::hash(b"message_1"),
        SignatureMessage::hash(b"message_2"),
        SignatureMessage::hash(b"message_3"),
        SignatureMessage::hash(b"message_4"),
        SignatureMessage::hash(b"message_5"),
    ];

    let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();

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
    dbg!(proof_messages.get(0).unwrap().get_message());

    let pok = Prover::commit_signature_pok(&proof_request, proof_messages.as_slice(), &signature)
        .unwrap();

    // complete other zkps as desired and compute `challenge_hash`
    // add bytes from other proofs

    let mut challenge_bytes = Vec::new();
    challenge_bytes.extend_from_slice(pok.to_bytes().as_slice());
    challenge_bytes.extend_from_slice(nonce.to_bytes_compressed_form().as_slice());

    let challenge = ProofChallenge::hash(&challenge_bytes);

    let proof = Prover::generate_signature_pok(pok, &challenge).unwrap();

    (proof, proof_request, nonce)
}

fn verify_proof(proof: &SignatureProof, proof_request: &ProofRequest, nonce: &ProofNonce) -> bool {
    // dbg!(&proof.revealed_messages);
    // dbg!(&proof.proof);
    // let bytes = proof.proof.to_bytes_compressed_form();
    // dbg!(&bytes[475]);
    // let proof2 = SignatureProof::from_bytes_compressed_form(bytes).unwrap();
    // dbg!(proof2.proof);

    // Send `proof` and `challenge` to Verifier

    let valid = match Verifier::verify_signature_pok(&proof_request, &proof, nonce) {
        Ok(_) => true,   // check revealed messages
        Err(_) => false, // Why did the proof failed
    };

    dbg!("proof ok");

    valid
}

fn main() {
    let (proof, proof_request, nonce) = generate_proof();
    verify_proof(&proof, &proof_request, &nonce);
}
