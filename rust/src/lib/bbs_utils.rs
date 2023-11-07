use bbs::prelude::PublicKey;
use bbs::{signature::Signature, SignatureMessage};
use bbs::{HashElem, ToVariableLengthBytes};

pub fn pk_from_str(pk_str: String) -> bbs::prelude::PublicKey {
    let pk_bytes = hex::decode(pk_str).unwrap();
    let pk = PublicKey::from_bytes_compressed_form(pk_bytes).unwrap();
    pk
}

pub fn verify_signature(
    signature_str: String,
    pk: &bbs::prelude::PublicKey,
    // messages: &Vec<SignatureMessage>,
    messages: &[SignatureMessage],
) -> bool {
    let signature_bytes = hex::decode(signature_str).unwrap();
    let fixed: [u8; 112] = signature_bytes.try_into().unwrap();
    let signature = Signature::from(fixed);

    let valid = signature.verify(messages, &pk).unwrap();
    assert!(valid);

    valid
}

pub fn gen_signature_str(
    pk: &bbs::prelude::PublicKey,
    sk: &bbs::prelude::SecretKey,
    messages: &[&str],
) -> String {
    let signature = gen_signature(pk, sk, messages);
    let bytes = Signature::to_bytes_compressed_form(&signature);
    let str = hex::encode(bytes);
    str
}

pub fn gen_signature(
    pk: &bbs::prelude::PublicKey,
    sk: &bbs::prelude::SecretKey,
    messages: &[&str],
) -> Signature {
    let msgs = messages
        .iter()
        .map(|m| SignatureMessage::hash(m.as_bytes()))
        .collect::<Vec<SignatureMessage>>();
    let signature = Signature::new(msgs.as_slice(), &sk, &pk).unwrap();
    signature
}

pub fn verify(signature_str: String, pk_str: String, messages: &[&str]) -> bool {
    let pk = pk_from_str(pk_str.to_string());
    let messages = messages
        .iter()
        .map(|m| SignatureMessage::hash(m.as_bytes()))
        .collect::<Vec<SignatureMessage>>();

    let valid = verify_signature(signature_str.to_string(), &pk, &messages);

    valid
}
