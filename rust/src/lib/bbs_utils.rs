use bbs::prelude::PublicKey;
use bbs::verifier::Verifier;
use bbs::{signature::Signature, SignatureMessage};
use bbs::{HashElem, ProofNonce, ProofRequest, SignatureProof, ToVariableLengthBytes};

pub fn serialize<T: ToVariableLengthBytes>(to_serialize: &T) -> String {
    let bytes = to_serialize.to_bytes_compressed_form();
    let str = hex::encode(bytes);
    str
}

pub fn deserialize<T: ToVariableLengthBytes>(
    serialized_str: &str,
) -> <T as ToVariableLengthBytes>::Output {
    let bytes = hex::decode(serialized_str).unwrap();
    let r = T::from_bytes_compressed_form(&bytes);
    r.ok().unwrap()
}

pub fn serialize_signature(signature: &Signature) -> String {
    let bytes = Signature::to_bytes_compressed_form(signature);
    let str = hex::encode(bytes);
    str
}

pub fn deserialize_signature(signature_str: &str) -> Signature {
    let bytes = hex::decode(signature_str).unwrap();
    let fixed: [u8; 112] = bytes.try_into().unwrap();
    let signature = Signature::from(fixed);
    signature
}

pub fn serialize_nonce(nonce: &ProofNonce) -> String {
    let bytes = ProofNonce::to_bytes_compressed_form(nonce);
    let str = hex::encode(bytes);
    str
}

pub fn deserialize_nonce(nonce_str: &str) -> ProofNonce {
    let bytes = hex::decode(nonce_str).unwrap();
    let fixed: [u8; 32] = bytes.try_into().unwrap();
    let nonce = ProofNonce::from(fixed);
    nonce
}

pub fn pk_from_str(pk_str: String) -> bbs::prelude::PublicKey {
    let pk_bytes = hex::decode(pk_str).unwrap();
    let pk = PublicKey::from_bytes_compressed_form(pk_bytes).unwrap();
    pk
}

pub fn verify_signature(
    signature_str: String,
    pk: &bbs::prelude::PublicKey,
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
