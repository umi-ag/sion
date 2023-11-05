use bbs::prelude::PublicKey;
use bbs::ToVariableLengthBytes;
use bbs::{signature::Signature, SignatureMessage};

pub fn pk_from_str(pk_str: String) -> bbs::prelude::PublicKey {
    let pk_bytes = hex::decode(pk_str).unwrap();
    let pk = PublicKey::from_bytes_compressed_form(pk_bytes).unwrap();
    pk
}

pub fn verify_signature(
    signature_str: String,
    pk: &bbs::prelude::PublicKey,
    messages: &Vec<SignatureMessage>,
) -> bool {
    let signature_bytes = hex::decode(signature_str).unwrap();
    let fixed: [u8; 112] = signature_bytes.try_into().unwrap();
    let signature = Signature::from(fixed);

    let valid = signature.verify(messages.as_slice(), &pk).unwrap();
    assert!(valid);

    valid
}
