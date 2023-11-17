#![cfg_attr(not(feature = "std"), no_std)]
#![cfg_attr(feature = "docs", feature(external_doc))]
#![cfg_attr(feature = "docs", deny(missing_docs))]
#![cfg_attr(feature = "docs", doc(include = "../README.md"))]
#![cfg_attr(
    feature = "docs",
    doc(html_root_url = "https://docs.rs/bulletproofs/4.0.0")
)]

extern crate alloc;

#[cfg(all(not(feature = "rust"), not(feature = "blst")))]
compile_error!("At least `rust` or `blst` must be selected");

pub mod inner_types {
    #[cfg(not(feature = "blst"))]
    pub use bls12_381_plus::{
        elliptic_curve::hash2curve::{ExpandMsgXof, ExpandMsgXmd},
        ff::{Field, PrimeField},
        group::{Curve, Group, GroupEncoding},
        *,
    };

    #[cfg(feature = "blst")]
    pub use blstrs_plus::{
        elliptic_curve::hash2curve::{ExpandMsgXof, ExpandMsgXmd},
        ff::{Field, PrimeField},
        group::{Curve, Group, GroupEncoding},
        pairing_lib::{MillerLoopResult, MultiMillerLoop},
        *,
    };
}

mod util;

#[cfg_attr(feature = "docs", doc(include = "../docs/notes-intro.md"))]
mod notes {
    #[cfg_attr(feature = "docs", doc(include = "../docs/notes-ipp.md"))]
    mod inner_product_proof {}
    #[cfg_attr(feature = "docs", doc(include = "../docs/notes-rp.md"))]
    mod range_proof {}
    #[cfg_attr(feature = "docs", doc(include = "../docs/notes-r1cs.md"))]
    mod r1cs_proof {}
}

mod errors;
mod generators;
mod inner_product_proof;
mod linear_proof;
mod range_proof;
mod transcript;

pub use crate::errors::ProofError;
pub use crate::generators::{BulletproofGens, BulletproofGensShare, PedersenGens};
pub use crate::linear_proof::LinearProof;
pub use crate::range_proof::RangeProof;
use subtle::Choice;

const HASH_DST: &[u8] = b"BLS12381G1_XOF:SHAKE-256_SSWU_RO_";

trait CtOptionOps<T> {
    fn ok_or<E>(self, err: E) -> Result<T, E>;
}

impl<T> CtOptionOps<T> for subtle::CtOption<T> {
    fn ok_or<E>(self, err: E) -> Result<T, E> {
        if self.is_some().unwrap_u8() == 1u8 {
            Ok(self.unwrap())
        } else {
            Err(err)
        }
    }
}

impl CtOptionOps<()> for Choice {
    fn ok_or<E>(self, err: E) -> Result<(), E> {
        if self.unwrap_u8() == 1u8 {
            Ok(())
        } else {
            Err(err)
        }
    }
}

#[cfg_attr(feature = "docs", doc(include = "../docs/aggregation-api.md"))]
pub mod range_proof_mpc {
    pub use crate::errors::MPCError;
    pub use crate::range_proof::dealer;
    pub use crate::range_proof::messages;
    pub use crate::range_proof::party;
}

#[cfg(feature = "yoloproofs")]
#[cfg(feature = "std")]
pub mod r1cs;
