use std::fmt;

#[derive(Debug, PartialEq)]
pub struct ProofChallenge(bbs::ProofChallenge);

impl ProofChallenge {
    pub fn inner(&self) -> &bbs::ProofChallenge {
        &self.0
    }
}

impl From<bbs::ProofChallenge> for ProofChallenge {
    fn from(c: bbs::ProofChallenge) -> Self {
        Self(c)
    }
}

impl fmt::Display for ProofChallenge {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let bytes = self.0.to_bytes_compressed_form();
        let hex = hex::encode(bytes);
        write!(f, "{}", hex)
    }
}
