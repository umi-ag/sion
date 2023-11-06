use bbs::prelude::HiddenMessage;
use bbs::prelude::ProofMessage;
use bbs::prelude::PublicKey;
use bbs::prelude::SecretKey;
use bbs::ProofChallenge;
use bbs::ProofNonce;
use bbs::ProofRequest;
use bbs::SignatureProof;
use bbs::ToVariableLengthBytes;
use bbs::{
    pm_hidden, pm_revealed, prelude::Issuer, prover::Prover, signature::Signature,
    verifier::Verifier, HashElem, SignatureMessage,
};
use sion::bbs_utils;

// proofを文字列にシリアライズ
// fn serialize_proof(proof: &SignatureProof) -> String {
//     let proof_bytes = proof.to_bytes_compressed_form();
//     let proof_str = hex::encode(proof_bytes);
//     proof_str
// }

// // proofを文字列からデシリアライズ
// fn deserialize_proof(proof_str: &str) -> SignatureProof {
//     let proof_bytes = hex::decode(proof_str).unwrap();
//     let proof = SignatureProof::from_bytes_compressed_form(proof_bytes).unwrap();
//     proof
// }

fn generate_proof(
    pk: &PublicKey,
    // sk: &SecretKey,
    // messages: &Vec<SignatureMessage>,
    signature: &Signature,
    proof_messages: &Vec<ProofMessage>,
) -> (SignatureProof, ProofRequest, ProofNonce) {
    // let (pk, sk) = Issuer::new_keys(5).unwrap();
    // let messages = vec![
    //     SignatureMessage::hash(b"message_1"),
    //     SignatureMessage::hash(b"message_2"),
    //     SignatureMessage::hash(b"message_3"),
    //     SignatureMessage::hash(b"message_4"),
    //     SignatureMessage::hash(b"message_5"),
    // ];

    // let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();

    let nonce = Verifier::generate_proof_nonce();
    let proof_request = Verifier::new_proof_request(&[1, 3], &pk).unwrap();

    // Sends `proof_request` and `nonce` to the prover
    // let proof_messages = vec![
    //     pm_hidden!(b"message_1"),
    //     pm_revealed!(b"message_2"),
    //     pm_hidden!(b"message_3"),
    //     pm_revealed!(b"message_4"),
    //     pm_hidden!(b"message_5"),
    // ];
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
    let (pk, sk) = Issuer::new_keys(5).unwrap();
    let messages = vec![
        SignatureMessage::hash(b"message_1"),
        SignatureMessage::hash(b"message_2"),
        SignatureMessage::hash(b"message_3"),
        SignatureMessage::hash(b"message_4"),
        SignatureMessage::hash(b"message_5"),
    ];
    let proof_messages = vec![
        pm_hidden!(b"message_1"),
        pm_revealed!(b"message_2"),
        pm_hidden!(b"message_3"),
        pm_revealed!(b"message_4"),
        pm_hidden!(b"message_5"),
    ];

    // let signature_str = gen_signature(&pk, &sk, &messages);
    let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();
    let (proof, proof_request, nonce) = generate_proof(&pk, &signature, &proof_messages);

    // let proof_str = serialize_proof(&proof);
    // let proof2 = deserialize_proof(&proof_str);
    // dbg!(proof_str);
    let proof_str = bbs_utils::serialize(&proof);
    let proof2 = bbs_utils::deserialize::<SignatureProof>(&proof_str);

    let proof_request_str = bbs_utils::serialize(&proof_request);
    let proof_request2 = bbs_utils::deserialize::<ProofRequest>(&proof_request_str);

    let nonce_str = bbs_utils::serialize_nonce(&nonce);
    let nonce2 = bbs_utils::deserialize_nonce(&nonce_str);

    verify_proof(&proof2, &proof_request2, &nonce2);
}
