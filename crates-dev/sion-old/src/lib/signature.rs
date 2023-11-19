use bbs::SignatureMessage;
use std::fmt;
use std::str::FromStr;

#[derive(Debug)]
pub struct Signature(bbs::signature::Signature);

impl Signature {
    pub fn new(
        messages: &[SignatureMessage],
        sk: &bbs::prelude::SecretKey,
        pk: &bbs::prelude::PublicKey,
    ) -> Self {
        let signature = bbs::signature::Signature::new(messages, sk, pk).expect("signature");
        Self(signature)
    }

    pub fn inner(&self) -> &bbs::signature::Signature {
        &self.0
    }
}

impl fmt::Display for Signature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let bytes = self.0.to_bytes_compressed_form();
        let s = hex::encode(bytes);
        write!(f, "{}", s)
    }
}

impl FromStr for Signature {
    type Err = Box<dyn std::error::Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let bytes = hex::decode(s)?;
        let fixed: [u8; 112] = bytes.try_into().expect("signature is 112 bytes");
        let bbs_signature = bbs::signature::Signature::from(fixed);
        Ok(Signature(bbs_signature))
    }
}
