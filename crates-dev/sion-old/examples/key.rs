use bbs::ToVariableLengthBytes;

fn main() {
    let (pk, sk) = sion::entry::generate_keypair(5);
    let pk2 = sion::bbs_utils::pk_from_str(&pk);
    let pk2_str = sion::bbs_utils::serialize(&pk2);

    dbg!(pk, pk2_str);

    let sk2 = sion::bbs_utils::sk_from_str(&sk);
    let sk2_str = hex::encode(sk2.to_bytes_compressed_form());

    dbg!(sk, sk2_str);
}
