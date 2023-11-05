use sion::bbs_utils;

use bbs::prelude::Issuer;
use bbs::ToVariableLengthBytes;

fn main() {
    let (pk, sk) = Issuer::new_keys(5).unwrap();
    let pk_str = hex::encode(pk.to_bytes_compressed_form());
    let sk_str = hex::encode(sk.to_bytes_compressed_form());

    dbg!("pk_str", &pk_str);

    let messages = vec![
        "message 1",
        "message 2",
        "message 3",
        "message 4",
        "message 5",
    ];
    let signature_str = bbs_utils::gen_signature(&pk, &sk, &messages);

    let valid = bbs_utils::verify(signature_str, pk_str, &messages);
    println!("Signature is valid: {}", valid);
}
