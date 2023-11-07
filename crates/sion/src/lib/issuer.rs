use bbs::HashElem;
use bbs::ToVariableLengthBytes;
use bbs::{
    prelude::{Issuer, PublicKey, SecretKey},
    SignatureMessage,
};

use crate::signature::Signature;

pub struct IssuerModule {
    sk: SecretKey,
    pk: PublicKey,
}

impl IssuerModule {
    pub fn new(message_count: usize) -> Self {
        let (pk, sk) = Issuer::new_keys(message_count).unwrap();
        IssuerModule { sk, pk }
    }

    pub fn pk(&self) -> &PublicKey {
        &self.pk
    }

    pub fn pk_str(&self) -> String {
        let pk_str = hex::encode(self.pk.to_bytes_compressed_form());
        pk_str
    }

    pub fn generate_signature(&self, messages: &[&str]) -> Signature {
        let messages = messages
            .iter()
            .map(|m| SignatureMessage::hash(m.as_bytes()))
            .collect::<Vec<_>>();
        Signature::new(&messages, &self.sk, &self.pk)
    }
}
