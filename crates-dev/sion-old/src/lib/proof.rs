use std::fmt;
use std::str::FromStr;

use bbs::prelude::PoKOfSignature;
use bbs::prover::Prover;
use bbs::ProofChallenge;

use crate::bbs_utils;

#[derive(Debug)]
pub struct SignatureProof(bbs::SignatureProof);

impl SignatureProof {
    pub fn new(pok_sig: PoKOfSignature, challenge: &ProofChallenge) -> Self {
        let proof = Prover::generate_signature_pok(pok_sig, challenge).unwrap();
        Self(proof)
    }

    pub fn inner(&self) -> &bbs::SignatureProof {
        &self.0
    }
}

impl fmt::Display for SignatureProof {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = bbs_utils::serialize::<bbs::SignatureProof>(&self.0);
        write!(f, "{}", s)
    }
}

impl FromStr for SignatureProof {
    type Err = Box<dyn std::error::Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let t = bbs_utils::deserialize::<bbs::SignatureProof>(s);
        Ok(Self(t))
    }
}
