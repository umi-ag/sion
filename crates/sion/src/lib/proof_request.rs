use std::fmt;
use std::str::FromStr;

use crate::bbs_utils;
use crate::keys::PublicKey;

#[derive(Debug)]
pub struct ProofRequest(bbs::ProofRequest);

impl ProofRequest {
    pub fn new(revealed_indices: &[usize], pk: &PublicKey) -> Self {
        let request = bbs::verifier::Verifier::new_proof_request(revealed_indices, &pk.0).unwrap();
        Self(request)
    }

    pub fn inner(&self) -> &bbs::ProofRequest {
        &self.0
    }
}

impl fmt::Display for ProofRequest {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = bbs_utils::serialize::<bbs::ProofRequest>(&self.0);
        write!(f, "{}", s)
    }
}

impl FromStr for ProofRequest {
    type Err = Box<dyn std::error::Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let t = bbs_utils::deserialize::<bbs::ProofRequest>(s);
        Ok(Self(t))
    }
}
