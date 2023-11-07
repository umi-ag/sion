use candid::types::number::Nat;
use sion::bbs_utils;
use std::{cell::RefCell, str::FromStr};

thread_local! {
    static COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0));
}

#[ic_cdk_macros::query]
fn verify_signature(signature_str: String, pk_str: String, messages: Vec<String>) -> bool {
    let signature = sion::signature::Signature::from_str(signature_str.as_str()).unwrap();
    let pk = bbs_utils::pk_from_str(pk_str.to_string());
    let msgs: Vec<&str> = messages.iter().map(AsRef::as_ref).collect();

    let valid = sion::verifier::verify_signature(&signature, &pk, &msgs);
    valid
}

#[ic_cdk_macros::query]
fn verify_proof(
    proof_str: String,
    proof_request_str: String,
    nonce_str: String,
    challenge_hash: String,
) -> bool {
    let valid = sion::entry::verify_proof(
        proof_str.as_str(),
        proof_request_str.as_str(),
        nonce_str.as_str(),
        challenge_hash.as_str(),
        &[],
    );
    valid
}

#[ic_cdk_macros::query]
fn verify_proof_old(proof_str: String, proof_request_str: String, nonce_str: String) -> bool {
    let proof = sion::proof::SignatureProof::from_str(&proof_str).unwrap();
    let proof_request = sion::proof_request::ProofRequest::from_str(&proof_request_str).unwrap();
    let nonce = sion::nonce::ProofNonce::from_str(&nonce_str).unwrap();

    let (valid, _) = sion::verifier::verify_proof(&proof, &proof_request, &nonce, &[]);

    valid
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
