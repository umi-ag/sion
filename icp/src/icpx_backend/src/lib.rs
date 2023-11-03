use bbs::prelude::HiddenMessage;
use bbs::prelude::ProofMessage;
use bbs::ProofChallenge;
use bbs::{
    pm_hidden, pm_revealed, prelude::Issuer, prover::Prover, signature::Signature,
    verifier::Verifier, HashElem, SignatureMessage,
};
use candid::types::number::Nat;
use std::cell::RefCell;

thread_local! {
    static COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0));
}

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

    // Send `proof` and `challenge` to Verifier

    match Verifier::verify_signature_pok(&proof_request, &proof, &nonce) {
        Ok(_) => assert!(true),   // check revealed messages
        Err(_) => assert!(false), // Why did the proof failed
    };

    dbg!("proof ok");
}

#[ic_cdk_macros::query]
fn pg() -> bool {
    sign();
    // proof();
    true
}

/// Get the value of the counter.
#[ic_cdk_macros::query]
fn get() -> Nat {
    COUNTER.with(|counter| (*counter.borrow()).clone())
}

/// Set the value of the counter.
#[ic_cdk_macros::update]
fn set(n: Nat) {
    // COUNTER.replace(n);  // requires #![feature(local_key_cell_methods)]
    COUNTER.with(|count| *count.borrow_mut() = n);
}

/// Increment the value of the counter.
#[ic_cdk_macros::update]
fn increment() {
    COUNTER.with(|counter| *counter.borrow_mut() += 1);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_set() {
        let expected = Nat::from(42);
        set(expected.clone());
        assert_eq!(get(), expected);
    }

    #[test]
    fn test_init() {
        assert_eq!(get(), Nat::from(0));
    }

    #[test]
    fn test_inc() {
        for i in 1..10 {
            increment();
            assert_eq!(get(), Nat::from(i));
        }
    }
}
