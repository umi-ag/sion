use bbs::prelude::PublicKey;
use bbs::prelude::SecretKey;
use bbs::ToVariableLengthBytes;

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

pub fn pk_from_str(pk_str: &str) -> bbs::prelude::PublicKey {
    let pk_bytes = hex::decode(pk_str).unwrap();
    let pk = PublicKey::from_bytes_compressed_form(pk_bytes).expect("pk");
    pk
}

pub fn sk_from_str(sk_str: &str) -> bbs::prelude::SecretKey {
    let bytes = hex::decode(sk_str).unwrap();
    let fixed: [u8; 32] = bytes.try_into().expect("sk is 32 bytes");
    SecretKey::from(&fixed)
}
