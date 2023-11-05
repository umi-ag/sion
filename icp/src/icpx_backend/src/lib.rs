use bbs::prelude::HiddenMessage;
use bbs::prelude::ProofMessage;
use bbs::prelude::PublicKey;
use bbs::ProofChallenge;
use bbs::ToVariableLengthBytes;
use bbs::{
    pm_hidden, pm_revealed, prelude::Issuer, prover::Prover, signature::Signature,
    verifier::Verifier, HashElem, SignatureMessage,
};
use candid::types::number::Nat;
use std::cell::RefCell;

thread_local! {
    static COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0));
}

fn sign() {
    let (pk, sk) = Issuer::new_keys(5).unwrap();

    let messages = vec![
        SignatureMessage::hash(b"message 1"),
        SignatureMessage::hash(b"message 2"),
        SignatureMessage::hash(b"message 3"),
        SignatureMessage::hash(b"message 4"),
        SignatureMessage::hash(b"message 5"),
    ];

    let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();

    assert!(signature.verify(messages.as_slice(), &pk).unwrap());
    dbg!("sign ok");
}

fn proof() {
    let (pk, sk) = Issuer::new_keys(5).unwrap();
    let messages = vec![
        SignatureMessage::hash(b"message_1"),
        SignatureMessage::hash(b"message_2"),
        SignatureMessage::hash(b"message_3"),
        SignatureMessage::hash(b"message_4"),
        SignatureMessage::hash(b"message_5"),
    ];

    let signature = Signature::new(messages.as_slice(), &sk, &pk).unwrap();

    let nonce = Verifier::generate_proof_nonce();
    let proof_request = Verifier::new_proof_request(&[1, 3], &pk).unwrap();

    // Sends `proof_request` and `nonce` to the prover
    let proof_messages = vec![
        pm_hidden!(b"message_1"),
        pm_revealed!(b"message_2"),
        pm_hidden!(b"message_3"),
        pm_revealed!(b"message_4"),
        pm_hidden!(b"message_5"),
    ];

    let pok = Prover::commit_signature_pok(&proof_request, proof_messages.as_slice(), &signature)
        .unwrap();

    // complete other zkps as desired and compute `challenge_hash`
    // add bytes from other proofs

    let mut challenge_bytes = Vec::new();
    challenge_bytes.extend_from_slice(pok.to_bytes().as_slice());
    challenge_bytes.extend_from_slice(nonce.to_bytes_compressed_form().as_slice());

    let challenge = ProofChallenge::hash(&challenge_bytes);

    let proof = Prover::generate_signature_pok(pok, &challenge).unwrap();

    // Send `proof` and `challenge` to Verifier

    match Verifier::verify_signature_pok(&proof_request, &proof, &nonce) {
        Ok(_) => assert!(true),   // check revealed messages
        Err(_) => assert!(false), // Why did the proof failed
    };

    dbg!("proof ok");
}

fn pk_from_str(pk_str: String) -> bbs::prelude::PublicKey {
    let pk_bytes = hex::decode(pk_str).unwrap();
    let pk = PublicKey::from_bytes_compressed_form(pk_bytes).unwrap();
    pk
}

fn verify(
    signature_str: String,
    pk: &bbs::prelude::PublicKey,
    messages: &Vec<SignatureMessage>,
) -> bool {
    let signature_bytes = hex::decode(signature_str).unwrap();
    let fixed: [u8; 112] = signature_bytes.try_into().unwrap();
    let signature = Signature::from(fixed);
    println!("restore {}", &signature.to_string());
    let bytes = Signature::to_bytes_compressed_form(&signature);
    let str = hex::encode(bytes);
    dbg!(str);
    let _sig = Signature::from(Signature::to_bytes_compressed_form(&signature));

    let valid = signature.verify(messages.as_slice(), &pk).unwrap();
    assert!(valid);
    dbg!("sign ok");

    valid
}

#[ic_cdk_macros::query]
fn pg() -> bool {
    let pk_str = "a6e6986b1d1df5ad6a09e4924bc457e3446c220e286bcbecc8d37e0a4cc5c4d3d229ebcb0e5530c4ffb89c36c95e93f20ddebd30582dcabe69b71185d1ed2b31be418002e8c33d1ee6afeea0ee09cf2931a58a8481bf60b2b325fa86da238a5eb3f6fb276052bea67f4df3046929333373d33d2de633401cd0a25dfe38ae30ebd699f272254e65ab1b10d1354a5c0e260000000581c3701d7a33a0a02dc8ba900b558991602a3c3a745faae8991f9d8818c8292397eed8380942636dca62a4dce4569a4b80fee889da4fdbeeb8a29901f8f437be953dd1dcc85c8be79fe98e5f8659161a3d193295dddec4c3672211c6e81365f7973ac7bcb27afe30df8248c568afd00af7a36285ecb1c49245279a97701609027c1fbf1297b51704cad8f5fcc91b9392aa07d6652065345acebb34fc77cb1dbd19989feae97e30b6f6c9c5539f312bf2071731d2bef7197497dbfe9bdece14a582062e84396e8b94d32bdc0e512f8341d2cbd9c2b4bc8d8457cecde8e006b1235b3af29308e3096282db4048f1534f26";
    let signature_str = "8edf66ef7732c8e3007ff5cb236356b30f731fc9306aa30e77b6bc571327e8c8d15f57c9178fafb1d71c0cfa88884176723ea0c877d4d8d8b794a61c3986c49545d1ed7cc8e3106dac37a73fe8d9ee9b0abec22da31dccb52c227b32232a943418c1073f40e1b5ac66146931c9ff5217";

    let messages = vec![
        SignatureMessage::hash(b"message 1"),
        SignatureMessage::hash(b"message 2"),
        SignatureMessage::hash(b"message 3"),
        SignatureMessage::hash(b"message 4"),
        SignatureMessage::hash(b"message 5"),
    ];

    let pk = pk_from_str(pk_str.to_string());
    let valid = verify(signature_str.to_string(), &pk, &messages);

    // sign();
    // proof();
    valid
}

#[ic_cdk_macros::query]
fn verify_signature(signature_str: String, pk_str: String, messages: Vec<String>) -> bool {
    let pk = pk_from_str(pk_str.to_string());
    let messages = messages
        .iter()
        .map(|m| SignatureMessage::hash(m.as_bytes()))
        .collect();
    dbg!(&signature_str, &pk_str, &messages);

    let valid = verify(signature_str.to_string(), &pk, &messages);

    valid
}

/// Get the value of the counter.
#[ic_cdk_macros::query]
fn get() -> Nat {
    COUNTER.with(|counter| (*counter.borrow()).clone())
}

/// Set the value of the counter.
#[ic_cdk_macros::update]
fn set(n: Nat) {
    // COUNTER.replace(n);  // requires #![feature(local_key_cell_methods)]
    COUNTER.with(|count| *count.borrow_mut() = n);
}

/// Increment the value of the counter.
#[ic_cdk_macros::update]
fn increment() {
    COUNTER.with(|counter| *counter.borrow_mut() += 1);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_set() {
        let expected = Nat::from(42);
        set(expected.clone());
        assert_eq!(get(), expected);
    }

    #[test]
    fn test_init() {
        assert_eq!(get(), Nat::from(0));
    }

    #[test]
    fn test_inc() {
        for i in 1..10 {
            increment();
            assert_eq!(get(), Nat::from(i));
        }
    }
}
