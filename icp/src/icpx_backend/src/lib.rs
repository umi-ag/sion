use candid::types::number::Nat;
use std::cell::RefCell;


// use bulletproofs::BulletproofGens;
// use bbs_plus::proof::PoKOfSignatureG1Proof;
// use anoncreds::verifier;

// use bls12_381_plus::Bls12381G1;

/// Success
use zeroize::Zeroize;
// use rand_core;
// use getrandom;
use keccak;
use amcl_wrapper::group_elem_g1::{G1Vector, G1};
use bulletproofs_amcl::utils::get_generators;
use amcl_wrapper::group_elem::GroupElement;


// use rand_core;
// use credx;

use merlin;
use merlin::Transcript;

use bulletproofs_amcl::r1cs::{R1CSProof, Verifier};


// use getrandom::getrandom;

/// Fail to deploy
///
// use merlin;
// use ark_marlin::Marlin;
// use credx::presentation::Presentation;
// use elliptic_curve::Curve;
// use merlin::TranscriptRng;
// use bbs_plus::prelude::*;
// use bulletproofs_plus_plus::prelude::*;

thread_local! {
    static COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0));
}

#[ic_cdk_macros::query]
fn get() -> Nat {
    COUNTER.with(|counter| (*counter.borrow()).clone())
}

#[ic_cdk_macros::update]
fn set(n: Nat) {
    // COUNTER.replace(n);  // requires #![feature(local_key_cell_methods)]
    COUNTER.with(|count| *count.borrow_mut() = n);
}

#[ic_cdk_macros::update]
fn increment() {
    COUNTER.with(|counter| *counter.borrow_mut() += 1);
}

#[ic_cdk_macros::query]
fn echo(input: String) -> String {
    input
}

#[ic_cdk_macros::query]
fn echo_base58(base58: String) -> String {
    let bytes = bs58::decode(base58).into_vec().unwrap();
    bs58::encode(bytes).into_string()
}

#[ic_cdk_macros::query]
fn echo_proof(base58: String) -> String {
    let bytes = bs58::decode(base58).into_vec().unwrap();
    let proof: R1CSProof = bcs::from_bytes(&bytes).unwrap();

    "ok".to_string()
}

#[ic_cdk_macros::query]
fn verify(base58: String) -> bool {
    let bytes = bs58::decode(base58).into_vec().unwrap();
    let proof: R1CSProof = bcs::from_bytes(&bytes).unwrap();

    let big_g: G1Vector = get_generators("G", 256).into();
    let big_h: G1Vector = get_generators("H", 256).into();
    let g = G1::from_msg_hash("g".as_bytes());
    let h = G1::from_msg_hash("h".as_bytes());

    let max_bits_in_val = 32;
    let min = 39;
    let max = 545;

    let transcript_label = b"Combination";
    let mut verifier_transcript = Transcript::new(transcript_label);
    let mut verifier = Verifier::new(&mut verifier_transcript);

    true
}


// #[ic_cdk_macros::query]
// fn vp() -> String {
//     let bytes = bs58::decode(VP).into_vec().unwrap();
//     let _: Presentation = bcs::from_bytes(&bytes).unwrap();
//     "ok".to_string()
// }

// #[ic_cdk_macros::query]
// fn vp2() -> String {
//     let bytes = bs58::decode(VP).into_vec().unwrap();
//     bs58::encode(bytes).into_string()
// }

#[cfg(test)]
mod tests {
    use super::*;
    use credx::presentation::Presentation;

    const VP: &'static str = "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";

    fn gen_vp() -> Presentation {
        let bytes = bs58::decode(VP).into_vec().unwrap();
        let presentation: Presentation = bcs::from_bytes(&bytes).unwrap();
        presentation
    }

    #[test]
    fn test_decode_vp() {
        gen_vp();
    }

    #[test]
    fn test_base58() {
        let bytes = bs58::decode(VP).into_vec().unwrap();
        bs58::encode(bytes).into_string();
    }

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
