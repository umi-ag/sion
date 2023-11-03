use bbs::messages;
use bbs::prelude::HiddenMessage;
use bbs::prelude::ProofMessage;
use bbs::prelude::PublicKey;
use bbs::ProofChallenge;
use bbs::{
    pm_hidden, pm_revealed, prelude::Issuer, prover::Prover, signature::Signature,
    verifier::Verifier, HashElem, ProofNonce, SignatureMessage,
};

fn sign() {
    let (pk, sk) = Issuer::new_keys(5).unwrap();

    let messages = vec![
        SignatureMessage::hash(b"message 1"),
        SignatureMessage::hash(b"message 2"),
        SignatureMessage::hash(b"message 3"),
        SignatureMessage::hash(b"message 4"),
        SignatureMessage::hash(b"message 5"),
    ];

    let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();
    // Signature::from(&signature);
    let bytes = Signature::to_bytes_compressed_form(&signature);
    let str = hex::encode(bytes);
    // println!(str);
    let _sig = Signature::from(Signature::to_bytes_compressed_form(&signature));

    assert!(signature.verify(messages.as_slice(), &pk).unwrap());
    dbg!("sign ok");
}

fn gen_signature(
    pk: &bbs::prelude::PublicKey,
    sk: &bbs::prelude::SecretKey,
    messages: &Vec<SignatureMessage>,
) -> String {
    let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();
    println!("gen {}", &signature.to_string());
    // Signature::from(&signature);
    let bytes = Signature::to_bytes_compressed_form(&signature);
    let str = hex::encode(bytes);
    str
}

fn verify_signature(
    signature_str: String,
    pk: &bbs::prelude::PublicKey,
    messages: &Vec<SignatureMessage>,
) {
    let signature_bytes = hex::decode(signature_str).unwrap();
    let fixed: [u8; 112] = signature_bytes.try_into().unwrap();
    let signature = Signature::from(fixed);
    println!("restore {}", &signature.to_string());
    let bytes = Signature::to_bytes_compressed_form(&signature);
    let str = hex::encode(bytes);
    dbg!(str);
    let _sig = Signature::from(Signature::to_bytes_compressed_form(&signature));

    assert!(signature.verify(messages.as_slice(), &pk).unwrap());
    dbg!("sign ok");
}

fn proof() {
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

    let pok = Prover::commit_signature_pok(&proof_request, proof_messages.as_slice(), &signature)
        .unwrap();

    // complete other zkps as desired and compute `challenge_hash`
    // add bytes from other proofs

    let mut challenge_bytes = Vec::new();
    challenge_bytes.extend_from_slice(pok.to_bytes().as_slice());
    challenge_bytes.extend_from_slice(nonce.to_bytes_compressed_form().as_slice());

    let challenge = ProofChallenge::hash(&challenge_bytes);

    let proof = Prover::generate_signature_pok(pok, &challenge).unwrap();
    dbg!(&proof.revealed_messages);
    dbg!(&proof.proof);

    // Send `proof` and `challenge` to Verifier

    match Verifier::verify_signature_pok(&proof_request, &proof, &nonce) {
        Ok(_) => assert!(true),   // check revealed messages
        Err(_) => assert!(false), // Why did the proof failed
    };

    dbg!("proof ok");
}

fn main() {
    let (pk, sk) = Issuer::new_keys(5).unwrap();
    dbg!(&pk);
    dbg!(&sk);

    let messages = vec![
        SignatureMessage::hash(b"message 1"),
        SignatureMessage::hash(b"message 2"),
        SignatureMessage::hash(b"message 3"),
        SignatureMessage::hash(b"message 4"),
        SignatureMessage::hash(b"message 5"),
    ];

    let signature_str = gen_signature(&pk, &sk, &messages);
    verify_signature(signature_str, &pk, &messages);

    // println!("Hello, world!");

    // sign();
    // proof();
}
