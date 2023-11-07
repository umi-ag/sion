#[derive(Debug)]
struct VerifierTuple {
    signature: String,
    pk: String,
    messages: Vec<String>,
}

fn main() {
    let issuer = sion::issuer::IssuerModule::new(5);

    let messages = vec![
        "message 1",
        "message 2",
        "message 3",
        "message 4",
        "message 5",
    ];
    let signature = issuer.generate_signature(&messages);

    let valid = sion::verifier::verify_signature(&signature, issuer.pk(), &messages);
    println!("Signature is valid: {}", valid);

    let tuple = VerifierTuple {
        signature: signature.to_string(),
        pk: issuer.pk_str().to_string(),
        messages: messages.into_iter().map(String::from).collect(),
    };
    dbg!(tuple);
}
