use bbs::HashElem;
use bbs::SignatureMessage;

use crate::keys::PublicKey;
use crate::keys::SecretKey;
use crate::signature::Signature;

pub fn generate_signature(messages: &[&str], sk: &SecretKey, pk: &PublicKey) -> Signature {
    let messages = messages
        .iter()
        .map(|m| SignatureMessage::hash(m.as_bytes()))
        .collect::<Vec<_>>();
    Signature::new(&messages, &sk.0, &pk.0)
}
