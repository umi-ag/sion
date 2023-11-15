use std::fmt;
use std::str::FromStr;

use bbs::verifier::Verifier;

#[derive(Debug)]
pub struct ProofNonce(bbs::ProofNonce);

impl ProofNonce {
    pub fn new() -> Self {
        let nonce = Verifier::generate_proof_nonce();
        ProofNonce(nonce)
    }

    pub fn inner(&self) -> &bbs::ProofNonce {
        &self.0
    }
}

impl fmt::Display for ProofNonce {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let bytes = self.0.to_bytes_compressed_form();
        let str = hex::encode(bytes);
        write!(f, "{}", str)
    }
}

impl FromStr for ProofNonce {
    type Err = Box<dyn std::error::Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let bytes = hex::decode(s)?;
        let fixed: [u8; 32] = bytes.try_into().expect("nonce is 32 bytes");
        let nonce = bbs::ProofNonce::from(fixed);
        Ok(ProofNonce(nonce))
    }
}
